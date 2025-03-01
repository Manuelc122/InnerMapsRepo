// This script generates embeddings for memories that don't have them
// Run with: node scripts/generate_embeddings.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function generateEmbeddingsForMemories() {
  try {
    console.log('Fetching memories without embeddings...');
    
    // Get memories without embeddings
    const { data: memories, error } = await supabase
      .from('coach_memories')
      .select('id, content')
      .is('embedding', null);
    
    if (error) {
      throw new Error(`Error fetching memories: ${error.message}`);
    }
    
    console.log(`Found ${memories.length} memories without embeddings`);
    
    // Process memories in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, Math.min(i + batchSize, memories.length));
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(memories.length/batchSize)}`);
      
      // Process each memory in the batch
      const promises = batch.map(async (memory) => {
        console.log(`Generating embedding for memory ${memory.id}`);
        const embedding = await generateEmbedding(memory.content);
        
        if (embedding) {
          // Update the memory with the embedding
          const { error: updateError } = await supabase
            .from('coach_memories')
            .update({ embedding })
            .eq('id', memory.id);
          
          if (updateError) {
            console.error(`Error updating memory ${memory.id}:`, updateError);
            return false;
          }
          
          console.log(`Successfully updated memory ${memory.id} with embedding`);
          return true;
        } else {
          console.error(`Failed to generate embedding for memory ${memory.id}`);
          return false;
        }
      });
      
      // Wait for all promises in the batch to resolve
      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      console.log(`Batch completed: ${successCount}/${batch.length} memories updated successfully`);
      
      // Add a delay between batches to avoid rate limiting
      if (i + batchSize < memories.length) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('Embedding generation completed!');
  } catch (error) {
    console.error('Error generating embeddings:', error);
  }
}

// Run the function
generateEmbeddingsForMemories(); 