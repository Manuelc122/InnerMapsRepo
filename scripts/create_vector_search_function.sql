-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a function to match memories based on embedding similarity
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  source_id uuid,
  source_type text,
  importance int,
  is_pinned boolean,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  user_notes text,
  summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id,
    cm.content,
    cm.source_id,
    cm.source_type,
    cm.importance,
    cm.is_pinned,
    cm.is_archived,
    cm.created_at,
    cm.updated_at,
    cm.user_notes,
    cm.summary,
    1 - (cm.embedding <=> query_embedding) AS similarity
  FROM
    coach_memories cm
  WHERE
    cm.user_id = p_user_id
    AND cm.is_archived = false
    AND cm.embedding IS NOT NULL
    AND 1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    cm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a function to find similar journal entries
CREATE OR REPLACE FUNCTION find_similar_journal_entries(
  query_text text,
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
DECLARE
  query_embedding vector(1536);
BEGIN
  -- Generate embedding for the query text
  -- This assumes you have a function to generate embeddings
  -- In practice, you would generate this in your application code
  -- and pass it as a parameter
  
  -- For now, we'll use a placeholder approach
  -- In a real implementation, you would replace this with actual embedding generation
  
  -- Find similar journal entries
  RETURN QUERY
  SELECT
    je.id,
    je.content,
    je.created_at,
    1 - (cm.embedding <=> query_embedding) AS similarity
  FROM
    journal_entries je
    JOIN coach_memories cm ON je.id = cm.source_id AND cm.source_type = 'journal_entry'
  WHERE
    je.user_id = p_user_id
    AND cm.embedding IS NOT NULL
    AND 1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    cm.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index on the embedding column for faster similarity searches
CREATE INDEX IF NOT EXISTS coach_memories_embedding_idx ON coach_memories USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 