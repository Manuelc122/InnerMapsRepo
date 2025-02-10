-- Function to check and create chat tables if they don't exist
CREATE OR REPLACE FUNCTION check_and_create_tables()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tables_status jsonb;
BEGIN
    -- Initialize status
    tables_status = '{
        "chat_sessions": false,
        "chat_messages": false,
        "tables_created": false
    }'::jsonb;
    
    -- Check if tables exist
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_sessions'
    ) THEN
        tables_status = jsonb_set(tables_status, '{chat_sessions}', 'true');
    END IF;

    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'chat_messages'
    ) THEN
        tables_status = jsonb_set(tables_status, '{chat_messages}', 'true');
    END IF;

    -- If either table is missing, create both
    IF (NOT (tables_status->>'chat_sessions')::boolean) OR 
       (NOT (tables_status->>'chat_messages')::boolean) THEN
        -- Call create_chat_tables function
        PERFORM create_chat_tables();
        tables_status = jsonb_set(tables_status, '{tables_created}', 'true');
    END IF;

    RETURN tables_status;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_and_create_tables() TO authenticated; 