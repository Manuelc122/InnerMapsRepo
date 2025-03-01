// This script generates memories for all existing journal entries that don't have memories
// Run with: node scripts/generate_memories_for_existing_entries.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateMemoriesForExistingEntries() {
  try {
    console.log('Finding journal entries without memories...');
    
    // Get all journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('id, user_id, content, created_at, timestamp');
    
    if (journalError) {
      throw new Error(`Error fetching journal entries: ${journalError.message}`);
    }
    
    console.log(`Found ${journalEntries.length} total journal entries`);
    
    if (journalEntries.length === 0) {
      console.log('No journal entries found. Exiting.');
      return;
    }
    
    // Get all existing memories
    const { data: existingMemories, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('source_id')
      .eq('source_type', 'journal_entry');
    
    if (memoriesError) {
      throw new Error(`Error fetching existing memories: ${memoriesError.message}`);
    }
    
    // Create a set of journal entry IDs that already have memories
    const entriesWithMemories = new Set(existingMemories.map(memory => memory.source_id));
    
    // Filter journal entries that don't have memories
    const entriesToProcess = journalEntries.filter(entry => !entriesWithMemories.has(entry.id));
    
    console.log(`Found ${entriesToProcess.length} journal entries without memories`);
    
    if (entriesToProcess.length === 0) {
      console.log('All journal entries already have memories. Exiting.');
      return;
    }
    
    // Process each journal entry
    let successCount = 0;
    let errorCount = 0;
    
    for (const entry of entriesToProcess) {
      console.log(`Creating memory for journal entry ${entry.id}`);
      
      const { data: memory, error: insertError } = await supabase
        .from('coach_memories')
        .insert({
          user_id: entry.user_id,
          content: entry.content,
          source_id: entry.id,
          source_type: 'journal_entry',
          created_at: entry.created_at || entry.timestamp || new Date().toISOString(),
          needs_embedding: true
        })
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error creating memory for entry ${entry.id}:`, insertError);
        errorCount++;
      } else {
        console.log(`Successfully created memory ${memory.id} for entry ${entry.id}`);
        successCount++;
      }
      
      // Add a small delay between operations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Memory generation completed!`);
    console.log(`Successfully created ${successCount} memories`);
    console.log(`Failed to create ${errorCount} memories`);
    
  } catch (error) {
    console.error('Error generating memories:', error);
  }
}

// Run the function
generateMemoriesForExistingEntries(); 