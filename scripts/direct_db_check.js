// This script directly checks the database tables without requiring authentication
// Run with: node scripts/direct_db_check.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Force reload of environment variables
dotenv.config({ override: true });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');

if (!supabaseUrl) {
  console.error('Error: Supabase URL is not set in the .env file');
  process.exit(1);
}

// Create two clients - one with service key and one with anon key
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseDirectly() {
  try {
    console.log('\nDirectly checking database tables...');
    
    // First try with service key if available
    if (supabaseService) {
      console.log('\n--- Using Service Key ---');
      await checkWithClient(supabaseService);
    }
    
    // Then try with anon key
    console.log('\n--- Using Anon Key ---');
    await checkWithClient(supabaseAnon);
    
    // If no entries were found and we have a service key, offer to create a test entry
    if (supabaseService) {
      const { data: journalEntries } = await supabaseService
        .from('journal_entries')
        .select('count', { count: 'exact', head: true });
      
      if (!journalEntries || journalEntries.count === 0) {
        console.log('\nNo journal entries found. Would you like to create a test entry?');
        console.log('To create a test entry, run: npm run create-test-entry');
      }
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

async function checkWithClient(client) {
  try {
    // Check journal_entries table
    const { data: journalEntries, error: journalError } = await client
      .from('journal_entries')
      .select('*');
    
    if (journalError) {
      console.error('Error checking journal_entries table:', journalError.message);
    } else {
      console.log(`Found ${journalEntries.length} journal entries`);
      
      if (journalEntries.length > 0) {
        console.log('\nSample journal entries:');
        journalEntries.slice(0, 3).forEach((entry, index) => {
          console.log(`\nEntry ${index + 1}:`);
          console.log(`ID: ${entry.id}`);
          console.log(`User ID: ${entry.user_id}`);
          console.log(`Content: ${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}`);
          console.log(`Created at: ${entry.created_at || entry.timestamp}`);
        });
        
        // Count entries by user
        const userCounts = {};
        journalEntries.forEach(entry => {
          userCounts[entry.user_id] = (userCounts[entry.user_id] || 0) + 1;
        });
        
        console.log('\nJournal entries by user:');
        Object.entries(userCounts).forEach(([userId, count]) => {
          console.log(`User ${userId}: ${count} entries`);
        });
      }
    }
    
    // Check coach_memories table
    const { data: memories, error: memoriesError } = await client
      .from('coach_memories')
      .select('*');
    
    if (memoriesError) {
      console.error('Error checking coach_memories table:', memoriesError.message);
    } else {
      console.log(`\nFound ${memories.length} memories in coach_memories table`);
      
      if (memories.length > 0) {
        console.log('\nSample memories:');
        memories.slice(0, 3).forEach((memory, index) => {
          console.log(`\nMemory ${index + 1}:`);
          console.log(`ID: ${memory.id}`);
          console.log(`User ID: ${memory.user_id}`);
          console.log(`Content: ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`);
          console.log(`Source ID: ${memory.source_id}`);
          console.log(`Source Type: ${memory.source_type}`);
          console.log(`Needs Embedding: ${memory.needs_embedding}`);
          console.log(`Has Embedding: ${memory.embedding ? 'Yes' : 'No'}`);
        });
        
        // Count memories by user
        const userCounts = {};
        memories.forEach(memory => {
          userCounts[memory.user_id] = (userCounts[memory.user_id] || 0) + 1;
        });
        
        console.log('\nMemories by user:');
        Object.entries(userCounts).forEach(([userId, count]) => {
          console.log(`User ${userId}: ${count} memories`);
        });
        
        // Count memories needing embeddings
        const needsEmbedding = memories.filter(m => m.needs_embedding).length;
        const hasEmbedding = memories.filter(m => m.embedding).length;
        
        console.log('\nEmbedding status:');
        console.log(`Memories needing embeddings: ${needsEmbedding}`);
        console.log(`Memories with embeddings: ${hasEmbedding}`);
        console.log(`Completion rate: ${Math.round((hasEmbedding / memories.length) * 100)}%`);
      }
    }
  } catch (error) {
    console.error('Error in checkWithClient:', error);
  }
}

// New function to create a test journal entry
async function createTestJournalEntry() {
  if (!supabaseService) {
    console.error('Error: Service key is required to create a test entry');
    console.log('Please add your service key to the .env file as VITE_SUPABASE_SERVICE_KEY');
    return;
  }
  
  try {
    console.log('Creating a test journal entry...');
    
    const testUserId = 'bc684b1b-81b9-4a6c-a941-69acb7e5c7c0'; // User ID from the screenshot
    const testEntry = {
      user_id: testUserId,
      content: 'This is a test journal entry created for testing the memory service.',
      created_at: new Date().toISOString()
    };
    
    const { data: entry, error } = await supabaseService
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
      
      const { data: memory, error: memoryError } = await supabaseService
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

// Export the function so it can be called from create-test-entry script
export { createTestJournalEntry };

// Run the function
checkDatabaseDirectly(); 