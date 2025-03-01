// This script adds the Supabase service key to the .env file
// Run with: node scripts/add_service_key.js YOUR_SERVICE_KEY

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the .env file (in the project root)
const envPath = path.join(__dirname, '..', '.env');

// Get the service key from command line arguments
const serviceKey = process.argv[2];

if (!serviceKey) {
  console.error('Error: No service key provided');
  console.log('Usage: node scripts/add_service_key.js YOUR_SERVICE_KEY');
  process.exit(1);
}

try {
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    process.exit(1);
  }

  // Read the current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');

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
  process.exit(1);
} 