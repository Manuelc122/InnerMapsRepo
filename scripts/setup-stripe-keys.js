import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file (one directory up from scripts)
const envPath = path.join(__dirname, '..', '.env');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for a value
const promptForValue = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Main async function to handle the prompts
const main = async () => {
  console.log('\n=== Stripe API Keys Setup ===\n');
  console.log('This script will update your .env file with your Stripe API keys.');
  console.log('Please provide the following information:\n');

  // Prompt for all required keys
  const stripePublishableKey = await promptForValue('1. Stripe Publishable Key (starts with pk_test_ or pk_live_): ');
  const stripeSecretKey = await promptForValue('2. Stripe Secret Key (starts with sk_test_ or sk_live_): ');

  // Validate inputs
  if (!stripePublishableKey || !stripeSecretKey) {
    console.log('\n⚠️  Both Publishable and Secret keys are required. Please run the script again and provide these values.');
    rl.close();
    return;
  }

  try {
    // Read the current .env file or create a template if it doesn't exist
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      // If .env doesn't exist, create a template
      envContent = `# API Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here`;
    }

    // Update all the keys in the content
    let updatedContent = envContent;
    
    // Replace or add each key
    const updateKey = (key, value) => {
      const regex = new RegExp(`${key}=.*`, 'g');
      if (updatedContent.match(regex)) {
        updatedContent = updatedContent.replace(regex, `${key}=${value}`);
      } else {
        // If key doesn't exist, add it
        updatedContent += `\n${key}=${value}`;
      }
    };

    updateKey('VITE_STRIPE_PUBLISHABLE_KEY', stripePublishableKey);
    updateKey('STRIPE_SECRET_KEY', stripeSecretKey);

    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, updatedContent);

    console.log('\n✅ Stripe API keys successfully updated in .env file!');
    
    // Update the stripeClient.ts file
    const stripeClientPath = path.join(__dirname, '..', 'src', 'utils', 'stripeClient.ts');
    let stripeClientContent = fs.readFileSync(stripeClientPath, 'utf8');
    
    console.log('✅ Stripe keys are now configured!');
    console.log('You can now run the application with: npm run dev');
  } catch (error) {
    console.error('\n❌ Error updating files:', error.message);
  } finally {
    rl.close();
  }
};

// Run the main function
main(); 