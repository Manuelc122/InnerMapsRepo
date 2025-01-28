import { supabase } from './supabase';
import { AuthError } from './errors';

const getRedirectUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment 
    ? `${window.location.origin}/auth/callback`
    : 'https://innermaps.co/auth/callback';
};

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new AuthError('Invalid email or password. Please try again.');
      }
      throw new AuthError(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Signin error:', error);
    throw error instanceof AuthError 
      ? error 
      : new AuthError('Failed to sign in. Please check your credentials and try again.');
  }
}

export async function signUp(email: string, password: string) {
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new AuthError('Password must be at least 8 characters long');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
          full_name: email.split('@')[0]
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        throw new AuthError('This email is already registered. Please sign in instead.');
      }
      throw new AuthError(error.message);
    }
    
    return {
      success: true,
      message: "Account created successfully! You can now sign in.",
      data
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error instanceof AuthError 
      ? error 
      : new AuthError('Failed to create account. Please try again.');
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AuthError(error.message);
  } catch (error) {
    console.error('Signout error:', error);
    throw error instanceof AuthError 
      ? error 
      : new AuthError('Failed to sign out. Please try again.');
  }
}