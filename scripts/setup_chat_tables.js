// Setup script for creating chat tables in Supabase
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required.');
  console.error('Please set them in your .env file.');
  process.exit(1);
}

// For direct SQL execution, we need the service role key
if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required for SQL execution.');
  console.error('Please add it to your .env file.');
  process.exit(1);
}

// Create a Supabase client with the service role key for admin privileges
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupChatTables() {
  console.log('Setting up chat tables in Supabase...');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'create_chat_tables.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL commands
    const { error } = await supabase.from('_sql').select('*').execute(sqlCommands);

    if (error) {
      throw new Error(`Error executing SQL: ${error.message}`);
    }

    console.log('Chat tables created successfully!');
  } catch (error) {
    console.error('Error setting up chat tables:', error.message);
    
    // Provide more detailed instructions for manual setup
    console.log('\nYou may need to manually create the tables using the Supabase dashboard:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy the contents of scripts/create_chat_tables.sql');
    console.log('4. Paste into the SQL Editor and run the query');
    
    process.exit(1);
  }
}

setupChatTables(); 