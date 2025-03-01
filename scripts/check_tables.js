// This script checks if the required database tables exist
// Run with: node scripts/check_tables.js

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

async function checkTables() {
  console.log('\nChecking database tables...');
  
  // Check journal_entries table
  try {
    const { data: journalData, error: journalError } = await supabase
      .from('journal_entries')
      .select('id')
      .limit(1);
    
    if (journalError) {
      console.error('Error accessing journal_entries table:', journalError.message);
    } else {
      console.log('✅ journal_entries table exists and is accessible');
    }
  } catch (error) {
    console.error('Error checking journal_entries table:', error.message);
  }
  
  // Check coach_memories table
  try {
    const { data: memoriesData, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('id')
      .limit(1);
    
    if (memoriesError) {
      console.error('Error accessing coach_memories table:', memoriesError.message);
    } else {
      console.log('✅ coach_memories table exists and is accessible');
    }
  } catch (error) {
    console.error('Error checking coach_memories table:', error.message);
  }
  
  // Check chat_messages table
  try {
    const { data: chatData, error: chatError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
    
    if (chatError) {
      console.error('Error accessing chat_messages table:', chatError.message);
    } else {
      console.log('✅ chat_messages table exists and is accessible');
    }
  } catch (error) {
    console.error('Error checking chat_messages table:', error.message);
  }
  
  // Check chat_sessions table
  try {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('id')
      .limit(1);
    
    if (sessionsError) {
      console.error('Error accessing chat_sessions table:', sessionsError.message);
    } else {
      console.log('✅ chat_sessions table exists and is accessible');
    }
  } catch (error) {
    console.error('Error checking chat_sessions table:', error.message);
  }
}

// Run the checks
checkTables(); 