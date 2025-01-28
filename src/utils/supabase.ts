import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('VITE_SUPABASE_URL is not configured');
  throw new Error('VITE_SUPABASE_URL is required');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('VITE_SUPABASE_ANON_KEY is not configured');
  throw new Error('VITE_SUPABASE_ANON_KEY is required');
}

console.log('Initializing Supabase client with URL:', import.meta.env.VITE_SUPABASE_URL);

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: 'innermaps-auth'
    }
  }
);

// Add connection status check
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}