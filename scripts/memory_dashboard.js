// This script provides a simple dashboard for monitoring the memory service
// Run with: node scripts/memory_dashboard.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getMemoryStats() {
  try {
    // Get total count of memories
    const { count: totalCount, error: totalError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      throw new Error(`Error getting total count: ${totalError.message}`);
    }
    
    // Get count of memories that need embeddings
    const { count: needsEmbeddingCount, error: needsEmbeddingError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true })
      .eq('needs_embedding', true);
    
    if (needsEmbeddingError) {
      throw new Error(`Error getting needs embedding count: ${needsEmbeddingError.message}`);
    }
    
    // Get count of memories with embeddings
    const { count: hasEmbeddingCount, error: hasEmbeddingError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);
    
    if (hasEmbeddingError) {
      throw new Error(`Error getting has embedding count: ${hasEmbeddingError.message}`);
    }
    
    // Get most recent memories
    const { data: recentMemories, error: recentError } = await supabase
      .from('coach_memories')
      .select('id, content, created_at, needs_embedding')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentError) {
      throw new Error(`Error getting recent memories: ${recentError.message}`);
    }
    
    // Get most recent processed memories
    const { data: recentProcessed, error: recentProcessedError } = await supabase
      .from('coach_memories')
      .select('id, content, created_at')
      .eq('needs_embedding', false)
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentProcessedError) {
      throw new Error(`Error getting recent processed memories: ${recentProcessedError.message}`);
    }
    
    return {
      totalCount,
      needsEmbeddingCount,
      hasEmbeddingCount,
      recentMemories,
      recentProcessed
    };
  } catch (error) {
    console.error('Error getting memory stats:', error);
    return null;
  }
}

function displayDashboard(stats) {
  console.clear();
  console.log('='.repeat(80));
  console.log(' '.repeat(30) + 'MEMORY SERVICE DASHBOARD');
  console.log('='.repeat(80));
  console.log();
  
  console.log('MEMORY STATISTICS:');
  console.log('-'.repeat(80));
  console.log(`Total Memories: ${stats.totalCount}`);
  console.log(`Memories Needing Embeddings: ${stats.needsEmbeddingCount}`);
  console.log(`Memories with Embeddings: ${stats.hasEmbeddingCount}`);
  console.log(`Completion Rate: ${((stats.hasEmbeddingCount / stats.totalCount) * 100).toFixed(2)}%`);
  console.log();
  
  console.log('RECENT MEMORIES:');
  console.log('-'.repeat(80));
  if (stats.recentMemories.length === 0) {
    console.log('No recent memories found.');
  } else {
    stats.recentMemories.forEach((memory, index) => {
      console.log(`${index + 1}. [${memory.created_at.substring(0, 19)}] ${memory.content.substring(0, 50)}...`);
      console.log(`   Status: ${memory.needs_embedding ? 'Needs Embedding' : 'Processed'}`);
      console.log();
    });
  }
  
  console.log('RECENTLY PROCESSED MEMORIES:');
  console.log('-'.repeat(80));
  if (stats.recentProcessed.length === 0) {
    console.log('No recently processed memories found.');
  } else {
    stats.recentProcessed.forEach((memory, index) => {
      console.log(`${index + 1}. [${memory.created_at.substring(0, 19)}] ${memory.content.substring(0, 50)}...`);
      console.log();
    });
  }
  
  console.log('='.repeat(80));
  console.log(`Last Updated: ${new Date().toISOString()}`);
  console.log('Press Ctrl+C to exit');
}

async function startDashboard() {
  try {
    console.log('Starting Memory Service Dashboard...');
    
    // Initial display
    const stats = await getMemoryStats();
    if (stats) {
      displayDashboard(stats);
    } else {
      console.error('Error getting memory stats. Please check your connection and try again.');
      process.exit(1);
    }
    
    // Update every 10 seconds
    setInterval(async () => {
      const updatedStats = await getMemoryStats();
      if (updatedStats) {
        displayDashboard(updatedStats);
      }
    }, 10000);
    
  } catch (error) {
    console.error('Error starting dashboard:', error);
    process.exit(1);
  }
}

// Start the dashboard
startDashboard(); 