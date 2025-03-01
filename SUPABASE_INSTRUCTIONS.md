# Checking the Database in Supabase Admin UI

Since we're having trouble accessing the database data through the API, let's check it directly in the Supabase admin UI.

## Steps to Check Journal Entries and Memories

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the "Table Editor" in the left sidebar
4. Select the `journal_entries` table to view all journal entries
5. Select the `coach_memories` table to view all memories

## SQL Queries to Run in the SQL Editor

You can also run SQL queries directly in the Supabase SQL Editor. Here are some useful queries:

### Check Journal Entries

```sql
-- Count all journal entries
SELECT COUNT(*) FROM journal_entries;

-- View all journal entries (limited to 100)
SELECT * FROM journal_entries LIMIT 100;

-- Count journal entries by user
SELECT user_id, COUNT(*) 
FROM journal_entries 
GROUP BY user_id;
```

### Check Memories

```sql
-- Count all memories
SELECT COUNT(*) FROM coach_memories;

-- View all memories (limited to 100)
SELECT * FROM coach_memories LIMIT 100;

-- Count memories by user
SELECT user_id, COUNT(*) 
FROM coach_memories 
GROUP BY user_id;

-- Check memories needing embeddings
SELECT COUNT(*) 
FROM coach_memories 
WHERE needs_embedding = true;

-- Check memories with embeddings
SELECT COUNT(*) 
FROM coach_memories 
WHERE embedding IS NOT NULL;
```

### Check Trigger

```sql
-- Check if the trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'journal_entries';

-- Check the trigger function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_memory_from_journal';
```

## Manually Creating Memories for Existing Journal Entries

If you need to manually create memories for existing journal entries, you can run this SQL:

```sql
-- Create memories for journal entries that don't have them
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
```

## Getting the Service Key

If you need to use the service key in your scripts, you can find it in the Supabase dashboard:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Project Settings" in the left sidebar
4. Click on "API" in the settings menu
5. Find the "service_role secret" under "Project API keys"
6. Add this key to your `.env` file as `VITE_SUPABASE_SERVICE_KEY`

```
VITE_SUPABASE_SERVICE_KEY=your-service-key-here
```

**Important**: Keep this key secure and never expose it in client-side code or public repositories. 