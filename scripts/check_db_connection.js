// This script checks the database connection and prints the environment variables
// Run with: node scripts/check_db_connection.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Not set');
console.log('VITE_OPENAI_API_KEY:', process.env.VITE_OPENAI_API_KEY ? 'Set' : 'Not set');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key is not set in the .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  try {
    console.log('Checking database connection...');
    
    // Try to get the server timestamp
    const { data, error } = await supabase.rpc('get_server_timestamp');
    
    if (error) {
      // If the RPC function doesn't exist, try a simple query instead
      console.log('RPC function not available, trying direct table query...');
      
      // Check if journal_entries table exists by getting count with proper syntax
      const { count: journalCount, error: journalError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true });
      
      if (journalError) {
        throw new Error(`Error connecting to database: ${journalError.message}`);
      }
      
      console.log(`Successfully connected to database! Found ${journalCount} journal entries.`);
    } else {
      console.log('Successfully connected to database!');
      console.log('Server timestamp:', data);
    }
    
    // Check if tables exist
    console.log('Checking tables...');
    
    // Check journal_entries table
    const { count: journalCount, error: journalError } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true });
    
    if (journalError) {
      console.error('Error checking journal_entries table:', journalError.message);
    } else {
      console.log(`journal_entries table: ${journalCount} entries`);
    }
    
    // Check coach_memories table
    const { count: memoriesCount, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true });
    
    if (memoriesError) {
      console.error('Error checking coach_memories table:', memoriesError.message);
    } else {
      console.log(`coach_memories table: ${memoriesCount} entries`);
    }
    
    // Check if the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
      console.log('You are not authenticated. Please log in to the application first.');
    } else if (user) {
      console.log('You are authenticated as:', user.id);
      
      // Check journal entries for this user
      const { count: userJournalCount, error: userJournalError } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (userJournalError) {
        console.error('Error checking user journal entries:', userJournalError.message);
      } else {
        console.log(`You have ${userJournalCount} journal entries`);
      }
      
      // Check memories for this user
      const { count: userMemoriesCount, error: userMemoriesError } = await supabase
        .from('coach_memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (userMemoriesError) {
        console.error('Error checking user memories:', userMemoriesError.message);
      } else {
        console.log(`You have ${userMemoriesCount} memories`);
        
        // Check memories that need embeddings
        const { count: needsEmbeddingCount, error: needsEmbeddingError } = await supabase
          .from('coach_memories')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('needs_embedding', true);
        
        if (needsEmbeddingError) {
          console.error('Error checking memories needing embeddings:', needsEmbeddingError.message);
        } else {
          console.log(`You have ${needsEmbeddingCount} memories that need embeddings`);
        }
      }
    } else {
      console.log('You are not authenticated. Please log in to the application first.');
    }
    
  } catch (error) {
    console.error('Error checking connection:', error);
  }
}

// Run the function
checkConnection(); 