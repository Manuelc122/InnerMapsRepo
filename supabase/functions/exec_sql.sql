-- Drop the function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create the function with better security and error handling
CREATE OR REPLACE FUNCTION exec_sql(sql_command text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log the attempt (you can remove this in production if you want)
    RAISE NOTICE 'Executing SQL: %', sql_command;
    
    BEGIN
        -- Execute the SQL command
        EXECUTE sql_command;
    EXCEPTION WHEN OTHERS THEN
        -- Log the error details
        RAISE EXCEPTION 'Error executing SQL: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION exec_sql(text) FROM public; 