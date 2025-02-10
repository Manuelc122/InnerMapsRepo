-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;

-- Create function to create tables if they don't exist
CREATE OR REPLACE FUNCTION create_chat_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create chat_sessions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_message TEXT,
        is_archived BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB DEFAULT '{}'::jsonb,
        CONSTRAINT fk_user
            FOREIGN KEY(user_id)
            REFERENCES auth.users(id)
            ON DELETE CASCADE
    );

    -- Create messages table if it doesn't exist
    CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        user_id UUID NOT NULL,
        content TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        metadata JSONB DEFAULT '{}'::jsonb,
        CONSTRAINT fk_session
            FOREIGN KEY(session_id)
            REFERENCES chat_sessions(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_user
            FOREIGN KEY(user_id)
            REFERENCES auth.users(id)
            ON DELETE CASCADE
    );

    -- Create indexes if they don't exist
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated 
        ON chat_sessions(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created 
        ON chat_sessions(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_session_created 
        ON messages(session_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_user_created 
        ON messages(user_id, created_at);

    -- Create or replace the session update trigger
    CREATE OR REPLACE FUNCTION update_session_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE chat_sessions
        SET 
            updated_at = NEW.created_at,
            last_message = NEW.content
        WHERE id = NEW.session_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop the trigger if it exists and recreate it
    DROP TRIGGER IF EXISTS update_session_on_message ON messages;
    CREATE TRIGGER update_session_on_message
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_session_timestamp();

    -- Enable Row Level Security
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

    -- Create or replace policies
    DO $policies$ 
    BEGIN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
        DROP POLICY IF EXISTS "Users can create their own chat sessions" ON chat_sessions;
        DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
        DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;
        DROP POLICY IF EXISTS "Users can view messages in their sessions" ON messages;
        DROP POLICY IF EXISTS "Users can create messages in their sessions" ON messages;
        DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
        DROP POLICY IF EXISTS "Users can soft delete their own messages" ON messages;

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
            ON messages FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM chat_sessions
                    WHERE id = session_id
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can create messages in their sessions"
            ON messages FOR INSERT
            WITH CHECK (
                auth.uid() = user_id AND
                EXISTS (
                    SELECT 1 FROM chat_sessions
                    WHERE id = session_id
                    AND user_id = auth.uid()
                )
            );

        CREATE POLICY "Users can update their own messages"
            ON messages FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can soft delete their own messages"
            ON messages FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (is_deleted = true);
    END $policies$;
END;
$$; 