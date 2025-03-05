import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Path to the migration file
const migrationFilePath = path.join(projectRoot, 'supabase/migrations/20240601000000_add_subscription_check_function.sql');

// Check if the file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Migration file not found: ${migrationFilePath}`);
  process.exit(1);
}

console.log('Deploying subscription check function to Supabase...');

try {
  // Read the SQL file
  const sql = fs.readFileSync(migrationFilePath, 'utf8');
  
  // Create a temporary file with the SQL command
  const tempFilePath = path.join(projectRoot, 'temp_migration.sql');
  fs.writeFileSync(tempFilePath, sql);
  
  // Execute the SQL using supabase CLI
  // Note: The actual command may vary depending on your Supabase setup
  // For local development, you might use:
  console.log('Pushing migration to Supabase...');
  execSync(`supabase db push`, { stdio: 'inherit' });
  
  // Clean up the temporary file
  fs.unlinkSync(tempFilePath);
  
  console.log('Subscription check function deployed successfully!');
} catch (error) {
  console.error('Error deploying subscription check function:', error);
  process.exit(1);
} 