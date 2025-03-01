// This script creates a test journal entry for testing the memory service
// Run with: node scripts/create-test-entry

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

async function createTestJournalEntry(userId) {
  try {
    console.log('Creating a test journal entry for user:', userId);
    
    const testEntry = {
      user_id: userId,
      content: `Test journal entry created at ${new Date().toISOString()}\n\nThis is a test entry to verify the memory system is working correctly. The entry should trigger the creation of a memory, which should then be visible in the Memory Manager.`,
      created_at: new Date().toISOString()
    };
    
    const { data: entry, error } = await supabase
      .from('journal_entries')
      .insert(testEntry)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test entry:', error.message);
    } else {
      console.log('Successfully created test journal entry:');
      console.log(entry);
      
      console.log('\nNow checking if the trigger created a memory...');
      
      // Wait a moment for the trigger to run
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: memory, error: memoryError } = await supabase
        .from('coach_memories')
        .select('*')
        .eq('source_id', entry.id)
        .eq('source_type', 'journal_entry');
      
      if (memoryError) {
        console.error('Error checking for memory:', memoryError.message);
      } else if (memory && memory.length > 0) {
        console.log('Memory was automatically created by the trigger:');
        console.log(memory[0]);
      } else {
        console.log('No memory was created by the trigger.');
        console.log('You may need to manually create memories using the create-memories script.');
      }
    }
  } catch (error) {
    console.error('Error creating test entry:', error);
  }
}

// Run the function with the specific user ID
const userId = 'bc684b1b-81b9-4a6c-a941-69acb8867e76';
console.log('Starting test setup...');
createTestJournalEntry(userId); 