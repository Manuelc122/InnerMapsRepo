-- Check if the journal_entries table has the expected structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'journal_entries';

-- Check if the coach_memories table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'coach_memories'
);

-- Check if the trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'journal_entries';

-- Drop and recreate the trigger function with better error handling and memory limit check
CREATE OR REPLACE FUNCTION public.generate_memory_from_journal()
RETURNS TRIGGER AS $$
DECLARE
  memory_count INTEGER;
  memory_limit INTEGER := 150; -- Set memory limit to 150
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Trigger executed for journal entry: %', NEW.id;
  
  BEGIN
    -- Check if the user has reached their memory limit
    SELECT COUNT(*) INTO memory_count
    FROM public.coach_memories
    WHERE user_id = NEW.user_id;
    
    -- If the user has reached the limit, log a warning and exit
    IF memory_count >= memory_limit THEN
      RAISE NOTICE 'Memory limit reached for user %: %/%', NEW.user_id, memory_count, memory_limit;
      RETURN NEW;
    END IF;
    
    -- If under the limit, create the memory
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
    RAISE NOTICE 'Memory created successfully for journal entry: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating memory: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS create_memory_from_journal ON public.journal_entries;

CREATE TRIGGER create_memory_from_journal
AFTER INSERT ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.generate_memory_from_journal();

-- Manually create memories for existing journal entries that don't have memories
-- but only if the user hasn't reached their memory limit
INSERT INTO public.coach_memories (
  user_id,
  content,
  source_id,
  source_type,
  created_at,
  needs_embedding
)
SELECT 
  je.user_id,
  je.content,
  je.id,
  'journal_entry',
  COALESCE(je.created_at, je.timestamp, now()),
  TRUE
FROM 
  public.journal_entries je
LEFT JOIN 
  public.coach_memories cm ON je.id = cm.source_id AND cm.source_type = 'journal_entry'
WHERE 
  cm.id IS NULL
AND (
  -- Only create memories for users who haven't reached the limit
  SELECT COUNT(*) FROM public.coach_memories WHERE user_id = je.user_id
) < 150; 