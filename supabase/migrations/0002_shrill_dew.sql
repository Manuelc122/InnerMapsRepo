/*
  # Chat Messages Table Setup

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `is_user` (boolean)
      - `timestamp` (timestamptz)
  
  2. Security
    - Enable RLS on `chat_messages` table
    - Add policy for authenticated users to manage their own messages
*/

-- Create chat messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  is_user boolean NOT NULL DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own messages
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can manage their own chat messages'
  ) THEN
    CREATE POLICY "Users can manage their own chat messages"
      ON chat_messages
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;