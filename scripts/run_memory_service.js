// This script runs the memory service directly, processing any memories that need embeddings
// Run with: node scripts/run_memory_service.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Force reload of environment variables
dotenv.config({ override: true });

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with regular key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

if (!supabaseUrl) {
  console.error('Error: Supabase URL is not set in the .env file');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('Error: OpenAI API key is not set in the .env file');
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

// Function to generate embeddings using OpenAI API
async function generateEmbedding(text) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
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
      .limit(10); // Process in batches
    
    if (error) {
      throw new Error(`Error fetching memories: ${error.message}`);
    }
    
    console.log(`Found ${memories.length} memories that need embeddings`);
    
    if (memories.length === 0) {
      console.log('No memories need embeddings. Exiting.');
      return;
    }
    
    // Process each memory
    for (const memory of memories) {
      console.log(`Processing memory ${memory.id}...`);
      
      try {
        // Generate embedding
        const embedding = await generateEmbedding(memory.content);
        
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
console.log('Starting memory service...');
processMemories(); 