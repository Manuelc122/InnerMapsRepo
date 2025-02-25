/**
 * Environment Variables Logger
 * This utility logs environment variables to the console for debugging purposes.
 * WARNING: Only use this in development environments, never in production!
 */

export const logEnvironmentVariables = () => {
  console.log('=== ENVIRONMENT VARIABLES ===');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present (not showing full key for security)' : 'Missing');
  console.log('VITE_DEEPSEEK_API_KEY:', import.meta.env.VITE_DEEPSEEK_API_KEY ? 'Present (not showing full key for security)' : 'Missing');
  console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'Present (not showing full key for security)' : 'Missing');
  console.log('=== END ENVIRONMENT VARIABLES ===');
}; 