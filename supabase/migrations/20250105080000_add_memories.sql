/*
  # Add memories table
  
  1. New Tables
    - `memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `source_entry_id` (uuid, references journal_entries)
      - `category` (text) - one of the predefined memory categories
      - `fact` (text) - the extracted memory fact
      - `confidence` (float) - confidence score of the extraction
      - `context` (text) - optional context from the source
      - `verified` (boolean) - whether the memory has been verified
      - `created_at` (timestamptz)
      - `last_updated` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  source_entry_id uuid REFERENCES journal_entries NOT NULL,
  category text NOT NULL CHECK (category IN (
    'personal_info', 'family', 'work', 'emotional', 'relationships',
    'health', 'goals', 'challenges', 'achievements', 'preferences'
  )),
  fact text NOT NULL,
  confidence float NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  context text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can view own memories'
  ) THEN
    CREATE POLICY "Users can view own memories"
      ON memories
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can create own memories'
  ) THEN
    CREATE POLICY "Users can create own memories"
      ON memories
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can update own memories'
  ) THEN
    CREATE POLICY "Users can update own memories"
      ON memories
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can delete own memories'
  ) THEN
    CREATE POLICY "Users can delete own memories"
      ON memories
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_memories_last_updated ON memories;
CREATE TRIGGER update_memories_last_updated
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memories_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories(user_id);
CREATE INDEX IF NOT EXISTS memories_source_entry_id_idx ON memories(source_entry_id);
CREATE INDEX IF NOT EXISTS memories_category_idx ON memories(category); 