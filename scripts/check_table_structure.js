// This script checks if the journal_entries table exists and has the correct structure
// Run with: node scripts/check_table_structure.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key is not set in the .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('Checking database table structure...');
    
    // Check if the journal_entries table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError.message);
      console.log('Trying alternative method...');
      
      // Try a direct query to the journal_entries table
      const { data: journalTest, error: journalTestError } = await supabase
        .from('journal_entries')
        .select('id')
        .limit(1);
      
      if (journalTestError) {
        console.error('Error accessing journal_entries table:', journalTestError.message);
        console.log('The journal_entries table may not exist or you may not have permission to access it.');
      } else {
        console.log('The journal_entries table exists and is accessible.');
      }
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('Tables in the public schema:', tableNames);
      
      if (tableNames.includes('journal_entries')) {
        console.log('The journal_entries table exists.');
      } else {
        console.log('The journal_entries table does not exist in the public schema.');
      }
    }
    
    // Try to get the structure of the journal_entries table
    console.log('\nAttempting to get the structure of the journal_entries table...');
    
    try {
      // Try a direct query to get a sample entry
      const { data: sampleEntry, error: sampleError } = await supabase
        .from('journal_entries')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error getting sample entry:', sampleError.message);
      } else if (sampleEntry && sampleEntry.length > 0) {
        console.log('Sample journal entry structure:');
        console.log(Object.keys(sampleEntry[0]));
        console.log('\nSample entry:');
        console.log(sampleEntry[0]);
      } else {
        console.log('No entries found in the journal_entries table.');
      }
    } catch (error) {
      console.error('Error getting table structure:', error);
    }
    
    // Check if the coach_memories table exists and its structure
    console.log('\nChecking coach_memories table...');
    
    try {
      const { data: sampleMemory, error: memoryError } = await supabase
        .from('coach_memories')
        .select('*')
        .limit(1);
      
      if (memoryError) {
        console.error('Error getting sample memory:', memoryError.message);
      } else if (sampleMemory && sampleMemory.length > 0) {
        console.log('Sample coach_memory structure:');
        console.log(Object.keys(sampleMemory[0]));
        console.log('\nSample memory:');
        console.log(sampleMemory[0]);
      } else {
        console.log('No entries found in the coach_memories table.');
      }
    } catch (error) {
      console.error('Error getting coach_memories structure:', error);
    }
    
    // Check authentication status
    console.log('\nChecking authentication status...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
    } else if (user) {
      console.log('You are authenticated as:', user.id);
    } else {
      console.log('You are not authenticated. Please log in to the application first.');
    }
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

// Run the function
checkTableStructure(); 