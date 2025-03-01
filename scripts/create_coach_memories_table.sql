-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create coach_memories table
CREATE TABLE IF NOT EXISTS public.coach_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('journal_entry', 'chat_message')),
  importance INTEGER NOT NULL DEFAULT 2 CHECK (importance BETWEEN 1 AND 3),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  summary TEXT,
  user_notes TEXT,
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS coach_memories_user_id_idx ON public.coach_memories(user_id);
CREATE INDEX IF NOT EXISTS coach_memories_source_id_idx ON public.coach_memories(source_id);
CREATE INDEX IF NOT EXISTS coach_memories_importance_idx ON public.coach_memories(importance);
CREATE INDEX IF NOT EXISTS coach_memories_is_pinned_idx ON public.coach_memories(is_pinned);
CREATE INDEX IF NOT EXISTS coach_memories_is_archived_idx ON public.coach_memories(is_archived);

-- Enable Row Level Security
ALTER TABLE public.coach_memories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own memories"
  ON public.coach_memories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories"
  ON public.coach_memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON public.coach_memories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON public.coach_memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.coach_memories
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to generate memory from journal entry
CREATE OR REPLACE FUNCTION public.generate_memory_from_journal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coach_memories (
    user_id,
    content,
    source_id,
    source_type,
    created_at
  ) VALUES (
    NEW.user_id,
    NEW.content,
    NEW.id,
    'journal_entry',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create memory when journal entry is created
CREATE TRIGGER create_memory_from_journal
AFTER INSERT ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.generate_memory_from_journal();

-- Create function to update memory when journal entry is updated
CREATE OR REPLACE FUNCTION public.update_memory_from_journal()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coach_memories
  SET content = NEW.content,
      updated_at = now()
  WHERE source_id = NEW.id AND source_type = 'journal_entry';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update memory when journal entry is updated
CREATE TRIGGER update_memory_from_journal
AFTER UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_memory_from_journal();

-- Create function to delete memory when journal entry is deleted
CREATE OR REPLACE FUNCTION public.delete_memory_from_journal()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.coach_memories
  WHERE source_id = OLD.id AND source_type = 'journal_entry';
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically delete memory when journal entry is deleted
CREATE TRIGGER delete_memory_from_journal
AFTER DELETE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.delete_memory_from_journal(); 