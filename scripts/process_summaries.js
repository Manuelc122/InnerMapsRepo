// This script generates summaries for memories that don't have them
// Run with: node scripts/process_summaries.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Force reload of environment variables
dotenv.config({ override: true });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

console.log('Checking environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
// Removed console.log with sensitive information

if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
  console.error('Error: Required environment variables are not set');
  process.exit(1);
}

// Create a client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateSummary(content) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, meaningful summaries of journal entries and chat messages. Create a summary that captures the key emotions, events, and insights in 1-2 sentences.'
          },
          {
            role: 'user',
            content: `Please summarize the following text in 1-2 sentences, focusing on the key emotions, events, and insights:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

async function processMemorySummaries() {
  try {
    console.log('Fetching memories without summaries...');
    
    // Get memories without summaries
    const { data: memories, error } = await supabase
      .from('coach_memories')
      .select('id, content')
      .is('summary', null);
    
    if (error) {
      throw new Error(`Error fetching memories: ${error.message}`);
    }
    
    console.log(`Found ${memories.length} memories without summaries`);
    
    if (memories.length === 0) {
      console.log('No memories need summaries. Exiting.');
      return;
    }
    
    // Process memories in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < memories.length; i += batchSize) {
      const batch = memories.slice(i, Math.min(i + batchSize, memories.length));
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(memories.length/batchSize)}`);
      
      // Process each memory in the batch
      const promises = batch.map(async (memory) => {
        console.log(`Generating summary for memory ${memory.id}`);
        const summary = await generateSummary(memory.content);
        
        if (summary) {
          // Update the memory with the summary
          const { error: updateError } = await supabase
            .from('coach_memories')
            .update({ summary })
            .eq('id', memory.id);
          
          if (updateError) {
            console.error(`Error updating memory ${memory.id}:`, updateError);
            return false;
          }
          
          console.log(`Successfully updated memory ${memory.id} with summary`);
          return true;
        } else {
          console.error(`Failed to generate summary for memory ${memory.id}`);
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
    
    console.log('Summary generation completed!');
  } catch (error) {
    console.error('Error generating summaries:', error);
  }
}

// Run the function
console.log('Starting summary generation...');
processMemorySummaries(); 