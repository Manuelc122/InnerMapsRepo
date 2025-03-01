// This script manually creates memories for existing journal entries
// Run with: node scripts/create_memories_for_entries.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Force reload of environment variables
dotenv.config({ override: true });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('Error: Supabase URL is not set in the .env file');
  process.exit(1);
}

// Check if service key is available
if (!supabaseServiceKey) {
  console.log('Warning: Supabase service key is not set in the .env file');
  console.log('This may cause issues with accessing data due to RLS policies');
  console.log('Please run: npm run prompt-service-key');
  console.log('Then run this script again');
  process.exit(1);
}

// Create a client with the service key for better access
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('Using Supabase service key for database access');

// The user ID from the screenshot
const USER_ID = 'bc684b1b-81b9-4a6c-a941-69acb7e5c7c0';

async function createMemoriesForEntries() {
  try {
    console.log(`Creating memories for journal entries for user ${USER_ID}...`);
    
    // Get all journal entries for the user
    const { data: journalEntries, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (journalError) {
      throw new Error(`Error fetching journal entries: ${journalError.message}`);
    }
    
    console.log(`Found ${journalEntries.length} journal entries for user ${USER_ID}`);
    
    if (journalEntries.length === 0) {
      console.log('No journal entries found. Exiting.');
      return;
    }
    
    // Get existing memories to avoid duplicates
    const { data: existingMemories, error: memoriesError } = await supabase
      .from('coach_memories')
      .select('source_id')
      .eq('source_type', 'journal_entry')
      .eq('user_id', USER_ID);
    
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
    
    console.log(`Memory creation completed!`);
    console.log(`Successfully created ${successCount} memories`);
    console.log(`Failed to create ${errorCount} memories`);
    
    // Now run the memory service to generate embeddings
    console.log('\nRunning memory service to generate embeddings...');
    await processMemories();
    
  } catch (error) {
    console.error('Error creating memories:', error);
  }
}

// Function to process memories that need embeddings
async function processMemories() {
  try {
    console.log('Checking for memories that need embeddings...');
    
    // Get memories that need embeddings
    const { data: memories, error } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('needs_embedding', true)
      .eq('user_id', USER_ID)
      .limit(50); // Process in batches
    
    if (error) {
      throw new Error(`Error fetching memories: ${error.message}`);
    }
    
    console.log(`Found ${memories.length} memories that need embeddings`);
    
    if (memories.length === 0) {
      console.log('No memories need embeddings. Exiting.');
      return;
    }
    
    // Check if OpenAI API key is set
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('Error: OpenAI API key is not set in the .env file');
      console.log('Memories created but embeddings not generated. Please run the memory service separately.');
      return;
    }
    
    // Import fetch dynamically
    const fetch = (await import('node-fetch')).default;
    
    // Process each memory
    for (const memory of memories) {
      console.log(`Processing memory ${memory.id}...`);
      
      try {
        // Generate embedding
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: memory.content,
            model: 'text-embedding-3-small'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
        }
        
        const data = await response.json();
        const embedding = data.data[0].embedding;
        
        // Update memory with embedding
        const { error: updateError } = await supabase
          .from('coach_memories')
          .update({
            embedding: embedding,
            needs_embedding: false
          })
          .eq('id', memory.id);
        
        if (updateError) {
          console.error(`Error updating memory ${memory.id}:`, updateError);
        } else {
          console.log(`Successfully updated memory ${memory.id} with embedding`);
        }
      } catch (error) {
        console.error(`Error processing memory ${memory.id}:`, error);
      }
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('Memory processing completed!');
    
  } catch (error) {
    console.error('Error processing memories:', error);
  }
}

// Run the function
createMemoriesForEntries(); 