-- Create sessions for orphaned messages
INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at, last_message)
SELECT 
    MIN(session_id) as id,
    user_id,
    'Imported Chat' as title,
    MIN(created_at) as created_at,
    MAX(created_at) as updated_at,
    (
        SELECT content 
        FROM chat_messages m2 
        WHERE m2.session_id = MIN(m1.session_id) 
        ORDER BY created_at DESC 
        LIMIT 1
    ) as last_message
FROM chat_messages m1
WHERE NOT EXISTS (
    SELECT 1 
    FROM chat_sessions s 
    WHERE s.id = m1.session_id
)
GROUP BY user_id, session_id
ON CONFLICT (id) DO NOTHING; 