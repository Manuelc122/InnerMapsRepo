-- Drop all chat-related database objects
DROP TRIGGER IF EXISTS update_chat_session_on_message ON chat_messages;
DROP FUNCTION IF EXISTS update_chat_session_timestamp();
DROP FUNCTION IF EXISTS create_chat_tables();
DROP FUNCTION IF EXISTS check_and_create_tables();
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
