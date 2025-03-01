// This script sets up a cron job to process memories that need embeddings
// It will run the process_embeddings_job.js script at regular intervals
// Run with: node scripts/cron-job.js

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { processMemoriesNeedingEmbeddings } from './process_embeddings_job.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the process_embeddings_job.js script
const scriptPath = join(__dirname, 'process_embeddings_job.js');

// Check if the script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Script not found at ${scriptPath}`);
  process.exit(1);
}

// Convert the script to CommonJS format for Node.js compatibility
const tempScriptPath = join(__dirname, 'temp_process_embeddings.cjs');

// Read the original script
const originalScript = fs.readFileSync(scriptPath, 'utf8');

// Convert ES modules imports to CommonJS
const convertedScript = originalScript
  .replace('import { createClient } from \'@supabase/supabase-js\';', 'const { createClient } = require(\'@supabase/supabase-js\');')
  .replace('import dotenv from \'dotenv\';', 'require(\'dotenv\').config();')
  .replace('dotenv.config();', '');

// Write the converted script to a temporary file
fs.writeFileSync(tempScriptPath, convertedScript);

console.log('Starting memory embedding processing job...');

// Function to run the embedding process
const runEmbeddingProcess = async () => {
  console.log(`Running embedding job at ${new Date().toISOString()}`);
  
  try {
    await processMemoriesNeedingEmbeddings();
    console.log(`Job completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error running embedding process:', error);
  }
};

// Run immediately on startup
runEmbeddingProcess();

// Set interval (e.g., every 5 minutes = 300000 ms)
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
console.log(`Setting up job to run every ${INTERVAL_MS / 60000} minutes`);

// Schedule the job to run at the specified interval
setInterval(runEmbeddingProcess, INTERVAL_MS);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down cron job...');
  // Clean up the temporary file
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down cron job...');
  // Clean up the temporary file
  if (fs.existsSync(tempScriptPath)) {
    fs.unlinkSync(tempScriptPath);
  }
  process.exit(0);
}); 