-- Enable RLS on all relevant tables
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can read their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can read their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can create their own memories" ON public.memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON public.memories;
DROP POLICY IF EXISTS "process_own_entries" ON public.journal_entries;
DROP POLICY IF EXISTS "create_memories_from_entries" ON public.memories;
DROP POLICY IF EXISTS "read_own_memories" ON public.memories;

-- Policy for journal entries
CREATE POLICY "Users can read their own entries"
ON public.journal_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
ON public.journal_entries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policies for memories
CREATE POLICY "Users can read their own memories"
ON public.memories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories"
ON public.memories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON public.memories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.journal_entries TO authenticated;
GRANT ALL ON public.memories TO authenticated;

-- Create or replace the process entries function
CREATE OR REPLACE FUNCTION public.process_user_entries()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function will run with definer's permissions but still checks user context
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
END;
$$;