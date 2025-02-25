-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting chat sessions
CREATE POLICY select_own_chat_sessions ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting chat sessions
CREATE POLICY insert_own_chat_sessions ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating chat sessions
CREATE POLICY update_own_chat_sessions ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting chat sessions
CREATE POLICY delete_own_chat_sessions ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for selecting chat messages
CREATE POLICY select_own_chat_messages ON chat_messages
  FOR SELECT USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for inserting chat messages
CREATE POLICY insert_own_chat_messages ON chat_messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for updating chat messages
CREATE POLICY update_own_chat_messages ON chat_messages
  FOR UPDATE USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for deleting chat messages
CREATE POLICY delete_own_chat_messages ON chat_messages
  FOR DELETE USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at); 