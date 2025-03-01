// This script updates all memory service scripts to use the service key
// Run with: node scripts/update_memory_scripts.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the scripts directory
const scriptsDir = __dirname;

// List of scripts to update
const scriptsToUpdate = [
  'process_embeddings_job.js',
  'cron-job.js',
  'memory_dashboard.js',
  'generate_memories_for_existing_entries.js',
  'check_journal_entries.js',
  'check_db_connection.js',
  'direct_db_check.js',
  'check_table_structure.js',
  'check_rls_policies.js'
];

// Function to update a script
function updateScript(scriptPath) {
  try {
    console.log(`Updating ${scriptPath}...`);
    
    // Read the script file
    let content = fs.readFileSync(scriptPath, 'utf8');
    
    // Check if the script already uses the service key
    if (content.includes('VITE_SUPABASE_SERVICE_KEY')) {
      console.log(`${scriptPath} already uses the service key`);
      return;
    }
    
    // Add the service key check
    let updated = false;
    
    // Replace dotenv.config() with the force reload version
    if (content.includes('dotenv.config()')) {
      content = content.replace('dotenv.config()', 'dotenv.config({ override: true })');
      updated = true;
    }
    
    // Add the service key variable
    if (content.includes('const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY')) {
      content = content.replace(
        'const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY',
        'const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY\nconst supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY'
      );
      updated = true;
    }
    
    // Add the service key check
    if (content.includes('const supabase = createClient(supabaseUrl, supabaseKey)')) {
      const serviceKeyCheck = `
// Check if service key is available
if (supabaseServiceKey) {
  console.log('Using Supabase service key for database access');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.log('Using Supabase anon key for database access');
  console.log('For better access, consider adding a service key with: npm run prompt-service-key');
  const supabase = createClient(supabaseUrl, supabaseKey);
}
`;
      
      content = content.replace(
        'const supabase = createClient(supabaseUrl, supabaseKey)',
        serviceKeyCheck
      );
      updated = true;
    }
    
    if (updated) {
      // Write the updated content back to the file
      fs.writeFileSync(scriptPath, content);
      console.log(`Updated ${scriptPath}`);
    } else {
      console.log(`No updates needed for ${scriptPath}`);
    }
    
  } catch (error) {
    console.error(`Error updating ${scriptPath}:`, error);
  }
}

// Update all scripts
console.log('Updating memory service scripts to use the service key...');

for (const script of scriptsToUpdate) {
  const scriptPath = path.join(scriptsDir, script);
  
  // Check if the script exists
  if (fs.existsSync(scriptPath)) {
    updateScript(scriptPath);
  } else {
    console.log(`Script ${script} not found`);
  }
}

console.log('Script updates completed!');
console.log('You can now run the memory service with: npm run run-memory-service');
console.log('Or create memories with: npm run create-memories');
console.log('If you haven\'t added your service key yet, run: npm run prompt-service-key'); 