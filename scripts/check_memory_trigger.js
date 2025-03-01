// This script checks if the memory trigger is working properly
// Run with: node scripts/check_memory_trigger.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Force reload of environment variables
dotenv.config({ override: true });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('Checking environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Required environment variables are not set');
  process.exit(1);
}

// Create a client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestJournalEntry() {
  try {
    console.log('\nCreating a test journal entry...');
    
    // Get a user to create the entry for
    const { data: users, error: usersError } = await supabase
      .from('journal_entries')
      .select('user_id')
      .limit(1);
    
    if (usersError) {
      console.error('Error getting a user ID:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No existing users found. Creating a test entry requires a user.');
      return;
    }
    
    const userId = users[0].user_id;
    console.log(`Using user ID: ${userId}`);
    
    // Create a test journal entry
    const testEntry = {
      user_id: userId,
      content: `Test journal entry created at ${new Date().toISOString()}\n\nThis is a test entry to verify the memory trigger is working correctly.`,
      created_at: new Date().toISOString()
    };
    
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert(testEntry)
      .select()
      .single();
    
    if (entryError) {
      console.error('Error creating test entry:', entryError.message);
      return;
    }
    
    console.log('Successfully created test journal entry:');
    console.log(`ID: ${entry.id}`);
    console.log(`User ID: ${entry.user_id}`);
    console.log(`Content: ${entry.content.substring(0, 50)}...`);
    console.log(`Created at: ${entry.created_at}`);
    
    // Wait a moment for the trigger to run
    console.log('\nWaiting for the trigger to run...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if a memory was created
    const { data: memory, error: memoryError } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('source_id', entry.id)
      .eq('source_type', 'journal_entry');
    
    if (memoryError) {
      console.error('Error checking for memory:', memoryError.message);
      return;
    }
    
    if (memory && memory.length > 0) {
      console.log('\n✅ Memory was automatically created by the trigger:');
      console.log(`Memory ID: ${memory[0].id}`);
      console.log(`User ID: ${memory[0].user_id}`);
      console.log(`Content: ${memory[0].content.substring(0, 50)}...`);
      console.log(`Source ID: ${memory[0].source_id}`);
      console.log(`Source Type: ${memory[0].source_type}`);
      console.log(`Importance: ${memory[0].importance}`);
      console.log(`Created at: ${memory[0].created_at}`);
      console.log(`Updated at: ${memory[0].updated_at}`);
      console.log(`Needs embedding: ${memory[0].needs_embedding}`);
      
      return true;
    } else {
      console.log('\n❌ No memory was created by the trigger.');
      console.log('The memory trigger may not be working properly.');
      console.log('You may need to run the setup_memory_system.sql script to set up the trigger.');
      
      return false;
    }
  } catch (error) {
    console.error('Error testing memory trigger:', error);
    return false;
  }
}

// Run the test
createTestJournalEntry(); 