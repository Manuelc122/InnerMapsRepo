-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the coach_memories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.coach_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  source_id UUID,
  source_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  embedding VECTOR(1536),
  needs_embedding BOOLEAN DEFAULT TRUE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_coach_memories_user_id ON public.coach_memories(user_id);

-- Create index on needs_embedding for faster queries
CREATE INDEX IF NOT EXISTS idx_coach_memories_needs_embedding ON public.coach_memories(needs_embedding);

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.generate_memory_from_journal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coach_memories (
    user_id,
    content,
    source_id,
    source_type,
    created_at,
    needs_embedding
  ) VALUES (
    NEW.user_id,
    NEW.content,
    NEW.id,
    'journal_entry',
    COALESCE(NEW.created_at, NEW.timestamp, now()),
    TRUE
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating memory: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS generate_memory_after_journal_insert ON public.journal_entries;

-- Create the trigger
CREATE TRIGGER generate_memory_after_journal_insert
AFTER INSERT ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.generate_memory_from_journal();

-- Drop the existing match_memories function if it exists
DROP FUNCTION IF EXISTS match_memories(vector(1536), float, int, uuid);

-- Create vector similarity search function
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_id UUID,
  source_type TEXT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    m.source_id,
    m.source_type,
    m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.coach_memories m
  WHERE m.user_id = p_user_id
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Drop the existing find_similar_journal_entries function if it exists
DROP FUNCTION IF EXISTS find_similar_journal_entries(text, float, int, uuid);

-- Create function to find similar journal entries
CREATE OR REPLACE FUNCTION find_similar_journal_entries(
  query_text TEXT,
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_embedding VECTOR(1536);
BEGIN
  -- Generate embedding for the query text
  -- This is a placeholder - in practice, you would call your embedding API
  -- For now, we'll use the existing embeddings
  
  SELECT embedding INTO query_embedding
  FROM public.coach_memories
  WHERE embedding IS NOT NULL
  LIMIT 1;
  
  RETURN QUERY
  SELECT
    j.id,
    j.content,
    j.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.journal_entries j
  JOIN public.coach_memories m ON j.id = m.source_id
  WHERE j.user_id = p_user_id
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Create index on embedding for faster similarity searches
CREATE INDEX IF NOT EXISTS idx_coach_memories_embedding ON public.coach_memories USING ivfflat (embedding vector_l2_ops)
WITH (lists = 100);

-- Update existing memories to need embedding
UPDATE public.coach_memories
SET needs_embedding = TRUE
WHERE embedding IS NULL; 