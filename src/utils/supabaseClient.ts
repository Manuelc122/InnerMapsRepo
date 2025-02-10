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
    detectSessionInUrl: true
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

// Add health check function with detailed error logging
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // First, try a simple auth check
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth check failed:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      return false;
    }
    console.log('Auth check passed, session status:', authData.session ? 'active' : 'none');

    // Then try a simple database query
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      // Log specific error details
      console.error('Database check failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Check if it's a connection error
      if (error.message.includes('connection') || error.code === 'PGRST301') {
        console.error('Connection error detected');
        return false;
      }
      
      // If the error is just that the table doesn't exist, we can still consider
      // the connection successful
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