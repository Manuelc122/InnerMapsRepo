// This script tests if the memory service is working
// It creates a test memory, sets needs_embedding to true, and checks if it gets processed
// Run with: node scripts/test_memory_service.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMemoryService() {
  try {
    console.log('Testing memory service...');
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Error getting user: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('No user logged in. Please log in first.');
    }
    
    console.log(`Logged in as user: ${user.id}`);
    
    // Create a test memory
    const testContent = `Test memory created at ${new Date().toISOString()}`;
    
    const { data: memory, error: insertError } = await supabase
      .from('coach_memories')
      .insert({
        user_id: user.id,
        content: testContent,
        source_type: 'test',
        needs_embedding: true
      })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Error creating test memory: ${insertError.message}`);
    }
    
    console.log(`Created test memory with ID: ${memory.id}`);
    
    // Wait for the memory service to process the memory
    console.log('Waiting for memory service to process the memory...');
    console.log('This may take a few minutes depending on your setup.');
    console.log('Press Ctrl+C to stop waiting and check manually.');
    
    // Check every 30 seconds for 5 minutes
    const maxChecks = 10;
    let checks = 0;
    
    const checkInterval = setInterval(async () => {
      checks++;
      
      console.log(`Check ${checks}/${maxChecks}...`);
      
      const { data: updatedMemory, error: checkError } = await supabase
        .from('coach_memories')
        .select('id, needs_embedding, embedding')
        .eq('id', memory.id)
        .single();
      
      if (checkError) {
        console.error(`Error checking memory: ${checkError.message}`);
        return;
      }
      
      if (!updatedMemory.needs_embedding && updatedMemory.embedding) {
        console.log('Success! Memory has been processed.');
        console.log('Memory service is working correctly.');
        clearInterval(checkInterval);
        process.exit(0);
      } else {
        console.log('Memory has not been processed yet.');
      }
      
      if (checks >= maxChecks) {
        console.log('Reached maximum number of checks.');
        console.log('The memory service may not be running or may be experiencing issues.');
        console.log('Please check the logs and make sure the service is running.');
        clearInterval(checkInterval);
        process.exit(1);
      }
    }, 30000); // Check every 30 seconds
    
  } catch (error) {
    console.error('Error testing memory service:', error);
    process.exit(1);
  }
}

// Run the test
testMemoryService(); 