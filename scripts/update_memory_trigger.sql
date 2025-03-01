-- Add a column to flag memories that need embeddings
ALTER TABLE public.coach_memories ADD COLUMN IF NOT EXISTS needs_embedding BOOLEAN DEFAULT TRUE;

-- Update the trigger function to set the flag
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