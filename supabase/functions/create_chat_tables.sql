CREATE OR REPLACE FUNCTION create_chat_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create chat_sessions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        last_message TEXT
    );

    -- Create messages table if it doesn't exist
    CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY,
        session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);

    -- Enable RLS
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    DO $policies$ BEGIN
        -- Chat Sessions policies
        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can view their own chat sessions'
        ) THEN
            CREATE POLICY "Users can view their own chat sessions"
                ON chat_sessions FOR SELECT
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can create their own chat sessions'
        ) THEN
            CREATE POLICY "Users can create their own chat sessions"
                ON chat_sessions FOR INSERT
                WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can update their own chat sessions'
        ) THEN
            CREATE POLICY "Users can update their own chat sessions"
                ON chat_sessions FOR UPDATE
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'chat_sessions' AND policyname = 'Users can delete their own chat sessions'
        ) THEN
            CREATE POLICY "Users can delete their own chat sessions"
                ON chat_sessions FOR DELETE
                USING (auth.uid() = user_id);
        END IF;

        -- Messages policies
        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their sessions'
        ) THEN
            CREATE POLICY "Users can view messages in their sessions"
                ON messages FOR SELECT
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can create messages in their sessions'
        ) THEN
            CREATE POLICY "Users can create messages in their sessions"
                ON messages FOR INSERT
                WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can update their own messages'
        ) THEN
            CREATE POLICY "Users can update their own messages"
                ON messages FOR UPDATE
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can delete their own messages'
        ) THEN
            CREATE POLICY "Users can delete their own messages"
                ON messages FOR DELETE
                USING (auth.uid() = user_id);
        END IF;
    END $policies$;
END;
$$; 