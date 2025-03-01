// This script processes memories that need embeddings
// It can be run as a scheduled job
// Run with: node scripts/process_embeddings_job.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenAI API key
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8191) // OpenAI has a token limit
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

async function processMemoriesNeedingEmbeddings() {
  try {
    console.log('Fetching memories that need embeddings...');
    
    // Get memories that need embeddings
    const { data: memories, error } = await supabase
      .from('coach_memories')
      .select('id, content')
      .eq('needs_embedding', true)
      .limit(10); // Process in small batches
    
    if (error) {
      throw new Error(`Error fetching memories: ${error.message}`);
    }
    
    console.log(`Found ${memories.length} memories that need embeddings`);
    
    if (memories.length === 0) {
      console.log('No memories need processing. Exiting.');
      return;
    }
    
    // Process each memory
    for (const memory of memories) {
      console.log(`Generating embedding for memory ${memory.id}`);
      const embedding = await generateEmbedding(memory.content);
      
      if (embedding) {
        // Update the memory with the embedding
        const { error: updateError } = await supabase
          .from('coach_memories')
          .update({ 
            embedding,
            needs_embedding: false
          })
          .eq('id', memory.id);
        
        if (updateError) {
          console.error(`Error updating memory ${memory.id}:`, updateError);
        } else {
          console.log(`Successfully updated memory ${memory.id} with embedding`);
        }
      } else {
        console.error(`Failed to generate embedding for memory ${memory.id}`);
      }
      
      // Add a small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Embedding processing completed!');
  } catch (error) {
    console.error('Error processing embeddings:', error);
  }
}

// Run the function
processMemoriesNeedingEmbeddings();

// Export the function for use in other modules
export { processMemoriesNeedingEmbeddings }; 