import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const getRedirectUrl = (plan?: 'monthly' | 'yearly') => {
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = isDevelopment 
    ? window.location.origin 
    : 'https://innermaps.co';
  return `${baseUrl}/auth/callback${plan ? `?plan=${plan}` : ''}`;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (plan?: 'monthly' | 'yearly') => Promise<void>;
  signInWithEmail: (email: string, password: string, plan?: 'monthly' | 'yearly') => Promise<void>;
  signUpWithEmail: (email: string, password: string, plan?: 'monthly' | 'yearly') => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | undefined>();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (plan?: 'monthly' | 'yearly') => {
    try {
      setError(null);
      if (plan) setSelectedPlan(plan);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(plan)
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, password: string, plan?: 'monthly' | 'yearly') => {
    try {
      setError(null);
      if (plan) setSelectedPlan(plan);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(plan)
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, plan?: 'monthly' | 'yearly') => {
    try {
      setError(null);
      if (plan) setSelectedPlan(plan);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(plan),
          data: {
            full_name: email.split('@')[0]
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}