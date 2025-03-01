// This script checks the RLS policies on the tables
// Run with: node scripts/check_rls_policies.js

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

async function checkRLSPolicies() {
  try {
    console.log('Checking RLS policies...');
    
    // Try to directly access the journal_entries table with a specific user ID
    const userId = 'bc684b1b-81b9-4a6c-a941-69acb7e5c7c0'; // User ID from the screenshot
    
    console.log(`Trying to access journal entries for user ${userId}...`);
    
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId);
    
    if (journalError) {
      console.error('Error accessing journal entries:', journalError.message);
    } else {
      console.log(`Found ${journalEntries.length} journal entries for user ${userId}`);
      
      if (journalEntries.length > 0) {
        console.log('\nSample journal entry:');
        console.log(journalEntries[0]);
      }
    }
    
    // Try to access the coach_memories table with the same user ID
    console.log(`\nTrying to access memories for user ${userId}...`);
    
    const { data: memories, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('user_id', userId);
    
    if (memoriesError) {
      console.error('Error accessing memories:', memoriesError.message);
    } else {
      console.log(`Found ${memories.length} memories for user ${userId}`);
      
      if (memories.length > 0) {
        console.log('\nSample memory:');
        console.log(memories[0]);
      }
    }
    
    // Check authentication status
    console.log('\nChecking authentication status...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError.message);
      console.log('You are not authenticated. This may be why you cannot access the data.');
      
      // Try to sign in anonymously to see if that helps
      console.log('\nTrying to sign in anonymously...');
      
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        
        if (signInError) {
          console.error('Error signing in anonymously:', signInError.message);
        } else {
          console.log('Signed in anonymously as:', signInData.user.id);
          
          // Try again with the new authentication
          console.log(`\nTrying again to access journal entries for user ${userId}...`);
          
          const { data: journalEntriesAfterAuth, error: journalErrorAfterAuth } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId);
          
          if (journalErrorAfterAuth) {
            console.error('Error accessing journal entries after auth:', journalErrorAfterAuth.message);
          } else {
            console.log(`Found ${journalEntriesAfterAuth.length} journal entries for user ${userId} after auth`);
          }
        }
      } catch (error) {
        console.error('Error during anonymous sign-in:', error);
      }
    } else {
      console.log('You are authenticated as:', user.id);
      
      if (user.id !== userId) {
        console.log(`\nYou are authenticated as a different user than the one in the screenshot (${userId}).`);
        console.log('This may be why you cannot access the data.');
      }
    }
    
    // Try a raw SQL query to check if RLS is enabled
    console.log('\nChecking if RLS is enabled on the tables...');
    
    try {
      const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_status');
      
      if (rlsError) {
        console.error('Error checking RLS status:', rlsError.message);
        console.log('The check_rls_status function may not exist.');
      } else {
        console.log('RLS status:', rlsData);
      }
    } catch (error) {
      console.error('Error checking RLS status:', error);
    }
    
  } catch (error) {
    console.error('Error checking RLS policies:', error);
  }
}

// Run the function
checkRLSPolicies(); 