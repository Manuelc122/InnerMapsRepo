// This script tests the memory system by creating a journal entry and checking if a memory is created
// Run with: node scripts/test_memory_system.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMemorySystem() {
  try {
    console.log('Testing memory system...');
    
    // 1. Authenticate (you'll need to replace this with your test user credentials)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'your-test-email@example.com',
      password: 'your-test-password',
    });
    
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    const userId = authData.user.id;
    console.log(`Authenticated as user: ${userId}`);
    
    // 2. Create a test journal entry
    const testContent = `Test journal entry created at ${new Date().toISOString()}`;
    console.log(`Creating test journal entry: "${testContent}"`);
    
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content: testContent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (journalError) {
      throw new Error(`Journal entry creation error: ${journalError.message}`);
    }
    
    console.log(`Journal entry created with ID: ${journalData.id}`);
    
    // 3. Wait a moment for the trigger to execute
    console.log('Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Check if a memory was created
    const { data: memoryData, error: memoryError } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('source_id', journalData.id)
      .eq('source_type', 'journal_entry');
    
    if (memoryError) {
      throw new Error(`Memory check error: ${memoryError.message}`);
    }
    
    if (memoryData && memoryData.length > 0) {
      console.log('SUCCESS: Memory was created!');
      console.log('Memory details:', memoryData[0]);
    } else {
      console.log('FAILURE: No memory was created for the journal entry.');
      
      // 5. Check database structure for debugging
      console.log('\nChecking database structure...');
      
      const { data: journalColumns } = await supabase
        .rpc('get_table_columns', { table_name: 'journal_entries' });
      
      console.log('Journal entries columns:', journalColumns);
      
      const { data: memoryColumns } = await supabase
        .rpc('get_table_columns', { table_name: 'coach_memories' });
      
      console.log('Coach memories columns:', memoryColumns);
      
      // 6. Check if trigger exists
      const { data: triggers } = await supabase
        .rpc('get_triggers', { table_name: 'journal_entries' });
      
      console.log('Triggers on journal_entries:', triggers);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Run the test
testMemorySystem(); 