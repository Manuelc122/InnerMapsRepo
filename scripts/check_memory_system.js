// This script checks the memory system and diagnoses any issues
// Run with: node scripts/check_memory_system.js

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

async function checkMemorySystem() {
  try {
    console.log('\n--- CHECKING DATABASE TABLES ---');
    
    // Check if journal_entries table exists
    try {
      const { data: journalEntries, error: journalError } = await supabase
        .from('journal_entries')
        .select('count(*)', { count: 'exact' })
        .limit(1);
      
      if (journalError) {
        console.error('Error checking journal_entries table:', journalError.message);
        console.log('❌ journal_entries table may not exist or has incorrect permissions');
      } else {
        console.log('✅ journal_entries table exists');
        
        // Get journal entries count
        const { count: journalCount, error: countError } = await supabase
          .from('journal_entries')
          .select('*', { count: 'exact' });
        
        if (countError) {
          console.error('Error counting journal entries:', countError.message);
        } else {
          console.log(`Found ${journalCount} journal entries`);
        }
      }
    } catch (error) {
      console.error('Error checking journal_entries table:', error.message);
    }
    
    // Check if coach_memories table exists
    try {
      const { data: memories, error: memoriesError } = await supabase
        .from('coach_memories')
        .select('count(*)', { count: 'exact' })
        .limit(1);
      
      if (memoriesError) {
        console.error('Error checking coach_memories table:', memoriesError.message);
        console.log('❌ coach_memories table may not exist or has incorrect permissions');
      } else {
        console.log('✅ coach_memories table exists');
        
        // Get memories count
        const { count: memoriesCount, error: countError } = await supabase
          .from('coach_memories')
          .select('*', { count: 'exact' });
        
        if (countError) {
          console.error('Error counting memories:', countError.message);
        } else {
          console.log(`Found ${memoriesCount} memories`);
        }
      }
    } catch (error) {
      console.error('Error checking coach_memories table:', error.message);
    }
    
    console.log('\n--- CHECKING USER AUTHENTICATION ---');
    
    // Check current user
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError.message);
        console.log('❌ No authenticated user found');
        console.log('You need to be logged in to view your memories');
      } else if (user) {
        console.log(`✅ Authenticated as user: ${user.id}`);
        
        // Check if user has journal entries
        const { data: userJournals, error: userJournalsError } = await supabase
          .from('journal_entries')
          .select('id')
          .eq('user_id', user.id);
        
        if (userJournalsError) {
          console.error('Error checking user journal entries:', userJournalsError.message);
        } else {
          console.log(`User has ${userJournals.length} journal entries`);
          
          if (userJournals.length > 0) {
            // Check if these journal entries have corresponding memories
            const journalIds = userJournals.map(j => j.id);
            const { data: relatedMemories, error: relatedMemoriesError } = await supabase
              .from('coach_memories')
              .select('id, source_id')
              .in('source_id', journalIds);
            
            if (relatedMemoriesError) {
              console.error('Error checking related memories:', relatedMemoriesError.message);
            } else {
              console.log(`Found ${relatedMemories.length} memories related to user's journal entries`);
              
              if (relatedMemories.length < userJournals.length) {
                console.log('❌ Not all journal entries have corresponding memories');
                console.log('This indicates the trigger may not be working properly');
              } else {
                console.log('✅ All journal entries have corresponding memories');
              }
            }
          } else {
            console.log('User has no journal entries. Create some to test the memory system.');
          }
        }
        
        // Check if user has memories
        const { data: userMemories, error: userMemoriesError } = await supabase
          .from('coach_memories')
          .select('id, summary')
          .eq('user_id', user.id);
        
        if (userMemoriesError) {
          console.error('Error checking user memories:', userMemoriesError.message);
        } else {
          console.log(`User has ${userMemories.length} memories`);
          
          // Check if memories have summaries
          const memoriesWithoutSummary = userMemories.filter(m => !m.summary);
          if (memoriesWithoutSummary.length > 0) {
            console.log(`❌ ${memoriesWithoutSummary.length} memories don't have summaries`);
            console.log('Run the process_summaries.js script to generate summaries');
          } else if (userMemories.length > 0) {
            console.log('✅ All memories have summaries');
          }
        }
      } else {
        console.log('❌ No authenticated user found');
        console.log('You need to be logged in to view your memories');
      }
    } catch (error) {
      console.error('Error checking authentication:', error.message);
      console.log('❌ Authentication check failed');
    }
    
    console.log('\n--- SUMMARY ---');
    console.log('To make the Memory Manager work properly:');
    console.log('1. Ensure you are logged in to the application');
    console.log('2. Create journal entries or chat with the coach');
    console.log('3. Verify that the memory trigger is working (memories are created from entries)');
    console.log('4. Run the process_summaries.js script to generate summaries for memories');
    console.log('5. Check the Memory Manager page to view your memories');
    
  } catch (error) {
    console.error('Error checking memory system:', error);
  }
}

// Run the checks
console.log('Starting memory system diagnostic...');
checkMemorySystem(); 