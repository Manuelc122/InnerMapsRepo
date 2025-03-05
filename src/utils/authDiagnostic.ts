import { supabase } from './supabaseClient';

/**
 * Diagnostic utility to check authentication and session state
 * This can be used to troubleshoot authentication issues
 */
export const checkAuthState = async () => {
  console.log('=== AUTH DIAGNOSTIC REPORT ===');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  // Check local storage for auth data
  console.log('\nLocal Storage:');
  const sbKey = `sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
  const hasAuthData = localStorage.getItem(sbKey) !== null;
  // Removed console.log with sensitive information
  
  // Check current session
  try {
    console.log('\nCurrent Session:');
    const { data: { session } } = await supabase.auth.getSession();
    console.log('- Session:', session ? '✅ Active' : '❌ Missing');
    if (session) {
      console.log('- User ID:', session.user.id);
      console.log('- Expires At:', new Date(session.expires_at! * 1000).toLocaleString());
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        // Removed console.log with sensitive information
      } else {
        // Removed console.log with sensitive information
      }
    }
  } catch (error) {
    console.error('- Error checking session:', error);
  }
  
  // Test database access
  try {
    console.log('\nDatabase Access:');
    const { data, error } = await supabase.from('chat_sessions').select('count').limit(1);
    if (error) {
      console.log('- Database Query: ❌ Failed');
      console.log('- Error:', error.message);
    } else {
      console.log('- Database Query: ✅ Successful');
    }
  } catch (error) {
    console.error('- Error testing database:', error);
  }
  
  console.log('\n=== END OF DIAGNOSTIC REPORT ===');
  
  return {
    clearAuthData: () => {
      localStorage.removeItem(sbKey);
      console.log(`Cleared auth data from localStorage (${sbKey})`);
    }
  };
}; 