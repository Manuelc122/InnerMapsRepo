import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

// Add validation for URL format
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

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': supabaseAnonKey,
      'Prefer': 'return=representation'
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
      try {
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        if (!refreshedSession) {
          console.log('No session available, returning null instead of throwing');
          return null;
        }
        
        return refreshedSession;
      } catch (refreshError: any) {
        // If we get an AuthSessionMissingError, just return null instead of throwing
        if (refreshError?.message && typeof refreshError.message === 'string' && 
            refreshError.message.includes('Auth session missing')) {
          console.log('Auth session missing, returning null instead of throwing');
          return null;
        }
        throw refreshError;
      }
    }
    
    return session;
  } catch (error: any) {
    console.error('Session recovery failed:', error);
    
    // If we get an AuthSessionMissingError, just return null instead of throwing
    if (error?.message && typeof error.message === 'string' && 
        error.message.includes('Auth session missing')) {
      console.log('Auth session missing, returning null instead of throwing');
      return null;
    }
    
    // Clear any invalid session data
    await supabase.auth.signOut();
    throw error;
  }
};

// Add health check function with detailed error logging
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First, try to recover the session
    const session = await recoverSession();
    console.log('Session status:', session ? 'active' : 'none');

    // Then try a simple database query
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1)
      .single();

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