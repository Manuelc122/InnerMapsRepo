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
  console.log('\n=== InnerMaps API Keys Setup ===\n');
  console.log('This script will update your .env file with the required API keys.');
  console.log('Please provide the following information:\n');

  // Prompt for all required keys
  const deepseekApiKey = await promptForValue('1. DeepSeek API Key (https://platform.deepseek.com): ');
  const openaiApiKey = await promptForValue('2. OpenAI API Key (https://platform.openai.com/api-keys): ');
  const supabaseUrl = await promptForValue('3. Supabase URL (from your Supabase project settings): ');
  const supabaseAnonKey = await promptForValue('4. Supabase Anon Key (from your Supabase project settings): ');

  // Validate inputs
  if (!deepseekApiKey || !openaiApiKey || !supabaseUrl || !supabaseAnonKey) {
    console.log('\n⚠️  All fields are required. Please run the script again and provide all values.');
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
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here`;
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

    updateKey('VITE_DEEPSEEK_API_KEY', deepseekApiKey);
    updateKey('VITE_OPENAI_API_KEY', openaiApiKey);
    updateKey('VITE_SUPABASE_URL', supabaseUrl);
    updateKey('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, updatedContent);

    console.log('\n✅ API keys successfully updated in .env file!');
    console.log('You can now run the application with: npm run dev');
  } catch (error) {
    console.error('\n❌ Error updating .env file:', error.message);
  } finally {
    rl.close();
  }
};

// Run the main function
main(); 