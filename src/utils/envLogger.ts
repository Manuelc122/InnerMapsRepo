/**
 * Environment Variables Logger
 * This utility logs environment variables to the console for debugging purposes.
 * WARNING: Only use this in development environments, never in production!
 */

export const logEnvironmentVariables = () => {
  console.log('=== ENVIRONMENT VARIABLES ===');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present (not showing full key for security)' : 'Missing');
  // Removed console.log with sensitive information
  // Removed console.log with sensitive information
  console.log('=== END ENVIRONMENT VARIABLES ===');
  
  // Check for placeholder values and prompt for real API keys
  promptForRealApiKeys();
};

export const promptForRealApiKeys = () => {
  const placeholderValues = [
    'your_deepseek_api_key_here',
    'your_openai_api_key_here',
    'your_supabase_url_here',
    'your_supabase_anon_key_here'
  ];
  
  const envVars = {
    'VITE_DEEPSEEK_API_KEY': import.meta.env.VITE_DEEPSEEK_API_KEY,
    'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
  };
  
  const missingOrPlaceholder = Object.entries(envVars)
    .filter(([_, value]) => !value || placeholderValues.includes(value))
    .map(([key]) => key);
  
  if (missingOrPlaceholder.length > 0) {
    console.log('\n\n');
    console.log('%c🔑 API KEYS REQUIRED 🔑', 'font-size: 20px; font-weight: bold; color: #ff6b6b;');
    console.log('%cPlease enter the following API keys to use the application:', 'font-size: 16px; color: #339af0;');
    
    missingOrPlaceholder.forEach(key => {
      console.log(`%c${key}:`, 'font-weight: bold; color: #339af0;');
      console.log(`%c> Please enter in the terminal and restart the app`, 'color: #51cf66;');
    });
    
    console.log('\n%cInstructions:', 'font-weight: bold; color: #339af0;');
    console.log('%c1. Stop this development server (Ctrl+C)', 'color: #51cf66;');
    console.log('%c2. Run "npm run setup-api-key" in your terminal', 'color: #51cf66;');
    console.log('%c3. Enter your API keys when prompted', 'color: #51cf66;');
    console.log('%c4. Restart the development server with "npm run dev"', 'color: #51cf66;');
    console.log('\n');
  }
}; 