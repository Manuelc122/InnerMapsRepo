-- First, let's check and fix the chat_sessions table
DO $$ 
BEGIN
    -- Add any missing columns to chat_sessions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'chat_sessions' AND column_name = 'is_archived') THEN
        ALTER TABLE chat_sessions ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'chat_sessions' AND column_name = 'metadata') THEN
        ALTER TABLE chat_sessions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add any missing columns to chat_messages
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'chat_messages' AND column_name = 'is_deleted') THEN
        ALTER TABLE chat_messages ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'chat_messages' AND column_name = 'metadata') THEN
        ALTER TABLE chat_messages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Ensure foreign key constraints exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_session_id_fkey'
    ) THEN
        ALTER TABLE chat_messages
        ADD CONSTRAINT chat_messages_session_id_fkey
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
        ON DELETE CASCADE;
    END IF;

    -- Update RLS policies
    -- First, enable RLS on both tables
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can create their own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;
    DROP POLICY IF EXISTS "Users can view messages in their sessions" ON chat_messages;
    DROP POLICY IF EXISTS "Users can create messages in their sessions" ON chat_messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

    -- Create new policies
    CREATE POLICY "Users can view their own chat sessions"
        ON chat_sessions FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own chat sessions"
        ON chat_sessions FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own chat sessions"
        ON chat_sessions FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own chat sessions"
        ON chat_sessions FOR DELETE
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can view messages in their sessions"
        ON chat_messages FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM chat_sessions
                WHERE id = session_id
                AND user_id = auth.uid()
            )
        );

    CREATE POLICY "Users can create messages in their sessions"
        ON chat_messages FOR INSERT
        WITH CHECK (
            auth.uid() = user_id AND
            EXISTS (
                SELECT 1 FROM chat_sessions
                WHERE id = session_id
                AND user_id = auth.uid()
            )
        );

    CREATE POLICY "Users can update their own messages"
        ON chat_messages FOR UPDATE
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own messages"
        ON chat_messages FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (is_deleted = true);

END $$; 