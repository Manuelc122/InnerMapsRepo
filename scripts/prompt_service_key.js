// This script checks if the Supabase service key exists in the .env file
// If not, it prompts the user to enter it and adds it to the .env file
// Run with: node scripts/prompt_service_key.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

// Force reload of environment variables
dotenv.config({ override: true });

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the .env file (in the project root)
const envPath = path.join(__dirname, '..', '.env');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function promptServiceKey() {
  try {
    console.log('Checking for Supabase service key...');
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('Error: .env file not found');
      process.exit(1);
    }

    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if the service key is already in the file
    if (envContent.includes('VITE_SUPABASE_SERVICE_KEY=') && 
        process.env.VITE_SUPABASE_SERVICE_KEY) {
      console.log('Supabase service key is already set in the .env file');
      rl.close();
      return;
    }
    
    console.log('\nThe Supabase service key is not set in your .env file.');
    console.log('You can find this key in the Supabase dashboard under:');
    // Removed console.log with sensitive information
    
    // Prompt the user for the service key
    rl.question('Please enter your Supabase service key: ', (serviceKey) => {
      if (!serviceKey.trim()) {
        console.error('Error: No service key provided');
        rl.close();
        process.exit(1);
      }
      
      try {
        // Check if the service key is already in the file
        if (envContent.includes('VITE_SUPABASE_SERVICE_KEY=')) {
          // Replace the existing service key
          envContent = envContent.replace(
            /VITE_SUPABASE_SERVICE_KEY=.*/,
            `VITE_SUPABASE_SERVICE_KEY=${serviceKey}`
          );
          console.log('Replaced existing service key in .env file');
        } else {
          // Add the service key to the end of the file
          envContent += `\nVITE_SUPABASE_SERVICE_KEY=${serviceKey}\n`;
          console.log('Added service key to .env file');
        }

        // Write the updated content back to the .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log('Service key has been successfully added to .env file');
        console.log('You can now run scripts that require the service key');
        
      } catch (error) {
        console.error('Error updating .env file:', error);
      } finally {
        rl.close();
      }
    });
  } catch (error) {
    console.error('Error checking service key:', error);
    rl.close();
    process.exit(1);
  }
}

// Run the function
promptServiceKey();

// Handle readline close
rl.on('close', () => {
  console.log('Service key check completed');
}); 