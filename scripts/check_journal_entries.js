// This script checks if there are journal entries in the database
// Run with: node scripts/check_journal_entries.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJournalEntries() {
  try {
    console.log('Checking journal entries...');
    
    // Get all journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*');
    
    if (journalError) {
      throw new Error(`Error fetching journal entries: ${journalError.message}`);
    }
    
    console.log(`Found ${journalEntries?.length || 0} journal entries`);
    
    if (journalEntries && journalEntries.length > 0) {
      console.log('Sample journal entry:');
      console.log(JSON.stringify(journalEntries[0], null, 2));
    }
    
    // Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
    } else {
      console.log('Current user:', user ? user.id : 'Not authenticated');
      
      if (user) {
        // Get journal entries for the current user
        const { data: userEntries, error: userEntriesError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id);
        
        if (userEntriesError) {
          console.error('Error fetching user journal entries:', userEntriesError.message);
        } else {
          console.log(`Found ${userEntries?.length || 0} journal entries for the current user`);
        }
      }
    }
    
    // Check coach_memories table
    const { data: memories, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('*');
    
    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError.message);
    } else {
      console.log(`Found ${memories?.length || 0} memories in the coach_memories table`);
    }
    
  } catch (error) {
    console.error('Error checking journal entries:', error);
  }
}

// Run the function
checkJournalEntries(); 