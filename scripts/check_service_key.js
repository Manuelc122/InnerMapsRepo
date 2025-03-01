// This script checks if the Supabase service key is working
// Run with: node scripts/check_service_key.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';

// Force reload of environment variables
dotenv.config({ override: true });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('Checking Supabase service key...');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');

if (!supabaseUrl) {
  console.error('Error: Supabase URL is not set in the .env file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('Error: Supabase service key is not set in the .env file');
  console.log('Please add your service key using: npm run prompt-service-key');
  process.exit(1);
}

// Create a client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkServiceKey() {
  try {
    console.log('\nTesting service key by querying the database...');
    
    // Try to access the journal_entries table
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .limit(1);
    
    if (journalError) {
      console.error('Error accessing journal_entries table:', journalError.message);
      console.log('The service key may not have the necessary permissions.');
      return false;
    }
    
    console.log('Successfully accessed journal_entries table!');
    console.log(`Found ${journalData.length} journal entries in sample`);
    
    // Try to access the coach_memories table
    const { data: memoriesData, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('*')
      .limit(1);
    
    if (memoriesError) {
      console.error('Error accessing coach_memories table:', memoriesError.message);
      return false;
    }
    
    console.log('Successfully accessed coach_memories table!');
    console.log(`Found ${memoriesData.length} memories in sample`);
    
    // Count total journal entries
    const { count: journalCount, error: countJournalError } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true });
    
    if (!countJournalError) {
      console.log(`Total journal entries: ${journalCount || 0}`);
    }
    
    // Count total memories
    const { count: memoriesCount, error: countMemoriesError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true });
    
    if (!countMemoriesError) {
      console.log(`Total memories: ${memoriesCount || 0}`);
    }
    
    console.log('\nService key is working correctly!');
    console.log('You can now use scripts that require the service key.');
    return true;
    
  } catch (error) {
    console.error('Error checking service key:', error);
    return false;
  }
}

// Run the function
checkServiceKey(); 