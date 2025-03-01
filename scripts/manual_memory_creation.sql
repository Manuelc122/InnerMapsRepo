-- This script manually creates memories for existing journal entries
-- Run this in the Supabase SQL Editor

-- First, let's check if there are any journal entries
SELECT COUNT(*) FROM journal_entries;

-- If there are journal entries, create memories for them
INSERT INTO coach_memories (
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
  journal_entries je
LEFT JOIN 
  coach_memories cm ON je.id = cm.source_id AND cm.source_type = 'journal_entry'
WHERE 
  cm.id IS NULL;

-- Check if memories were created
SELECT COUNT(*) FROM coach_memories;

-- Check the structure of the journal_entries table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'journal_entries';

-- Check the structure of the coach_memories table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coach_memories';

-- Check if the trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'journal_entries';

-- Check if the trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_memory_from_journal'; 