import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables for debugging
console.log('=== SUPABASE ENVIRONMENT VARIABLES ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present (not showing for security)' : 'Missing');
console.log('=== END SUPABASE ENVIRONMENT VARIABLES ===');

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

if (!isValidUrl(supabaseUrl)) {
  console.error('Invalid Supabase URL:', supabaseUrl);
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

// Initialize Supabase client
console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'innermaps-auth'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  },
  db: {
    schema: 'public'
  }
});

// Add session recovery function
export const recoverSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!session) {
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      if (!refreshedSession) throw new Error('No session available');
      
      return refreshedSession;
    }
    
    return session;
  } catch (error) {
    console.error('Session recovery failed:', error);
    // Clear any invalid session data
    await supabase.auth.signOut();
    throw error;
  }
};

// Add health check function
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First, try to recover the session
    const session = await recoverSession();
    console.log('Session status:', session ? 'active' : 'none');

    // Then try a simple database query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database check failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message.includes('connection') || error.code === 'PGRST301') {
        console.error('Connection error detected');
        return false;
      }
      
      if (error.code === '42P01') {
        console.log('Tables not found, but connection successful');
        return true;
      }
      
      return false;
    }

    console.log('Database check passed, connection verified');
    return true;
  } catch (error) {
    console.error('Unexpected error during connection check:', error);
    return false;
  }
}; 