import { supabase } from '../supabase';
import { AuthError } from '../errors';

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new AuthError(error.message);
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user ?? null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}