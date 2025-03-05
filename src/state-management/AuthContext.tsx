import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection, recoverSession } from '../utils/supabaseClient';
import type { User, AuthResponse, SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { validatePassword, validateEmail, sanitizeInput } from '../utils/validation';

// Security constants
const MAX_AUTH_RETRIES = 3;
const AUTH_COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

const getRedirectUrl = (plan?: 'monthly' | 'yearly', isNewUser: boolean = true) => {
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = isDevelopment 
    ? window.location.origin 
    : 'https://innermaps.co';
  
  let url = `${baseUrl}/auth/callback`;
  
  // Add query parameters if needed
  const params = new URLSearchParams();
  if (plan) params.set('plan', plan);
  if (isNewUser) params.set('new_user', 'true');
  
  // Append parameters if any exist
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string, plan?: 'monthly' | 'yearly') => Promise<void>;
  signUpWithEmail: (email: string, password: string, plan?: 'monthly' | 'yearly') => Promise<{ success: boolean; redirectTo?: string; message?: string; }>;
  signOut: () => Promise<void>;
  error: string | null;
  isConnected: boolean;
  sessionTimeRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT);

  // Update last activity time on user interaction
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(Date.now());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  // Check for session timeout and inactivity
  useEffect(() => {
    if (!user || !sessionStart) return;

    const checkSession = () => {
      const now = Date.now();
      const sessionAge = now - sessionStart;
      const inactivityTime = now - lastActivityTime;

      // Check session timeout
      if (sessionAge >= SESSION_TIMEOUT) {
        signOut();
        setError('Session expired. Please sign in again.');
        return;
      }

      // Check inactivity timeout
      if (inactivityTime >= INACTIVITY_TIMEOUT) {
        signOut();
        setError('Session ended due to inactivity. Please sign in again.');
        return;
      }

      // Update remaining session time
      setSessionTimeRemaining(Math.max(0, SESSION_TIMEOUT - sessionAge));
    };

    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, [user, sessionStart, lastActivityTime]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to recover the session
        const session = await recoverSession();
        setUser(session?.user ?? null);
        setIsConnected(true);
        
        if (session?.user) {
          setSessionStart(Date.now());
          setLastActivityTime(Date.now());
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        setUser(null);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        setSessionStart(Date.now());
        setLastActivityTime(Date.now());
      } else if (event === 'SIGNED_OUT') {
        setSessionStart(null);
        setSessionTimeRemaining(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string, plan?: 'monthly' | 'yearly') => {
    try {
      setError(null);
      
      const sanitizedEmail = sanitizeInput(email);
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      const now = Date.now();
      if (authAttempts >= MAX_AUTH_RETRIES && (now - lastAttemptTime) < AUTH_COOLDOWN_TIME) {
        const remainingCooldown = Math.ceil((AUTH_COOLDOWN_TIME - (now - lastAttemptTime)) / 1000 / 60);
        throw new Error(`Too many login attempts. Please try again in ${remainingCooldown} minutes.`);
      }

      const credentials: SignInWithPasswordCredentials = {
        email: sanitizedEmail,
        password
      };

      const { error, data }: AuthResponse = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        setAuthAttempts(prev => prev + 1);
        setLastAttemptTime(now);
        throw error;
      }

      setSessionStart(Date.now());
      setLastActivityTime(Date.now());
      setAuthAttempts(0);
      setLastAttemptTime(0);
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      console.error('Sign in error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUpWithEmail = async (email: string, password: string, plan?: 'monthly' | 'yearly') => {
    try {
      setError(null);
      console.log('Starting signup process');

      // Input validation and sanitization
      const sanitizedEmail = sanitizeInput(email);
      if (!validateEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join('\n'));
      }

      if (plan) setSelectedPlan(plan);
      
      console.log('Calling supabase.auth.signUp');
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(plan, true),
          data: {
            full_name: sanitizedEmail.split('@')[0]
          }
        }
      });
      
      if (error) throw error;
      
      console.log('Signup successful, session:', data.session ? 'exists' : 'does not exist');
      
      // If registration is successful and we have a session, redirect to payment page
      if (data.session) {
        // Set the user so the app knows we're logged in
        setUser(data.session.user);
        setSessionStart(Date.now());
        setLastActivityTime(Date.now());
        
        console.log('Setting user and session data before redirect');
        // Don't use window.location.href as it causes a full page reload
        // The redirect will happen through React Router in the component that called this function
        return { success: true, redirectTo: '/subscription' };
      }
      
      return { success: true, message: 'Please check your email to confirm your account' };
    } catch (err) {
      console.error('Signup error:', err);
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
      setSessionStart(null);
      setSessionTimeRemaining(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      error,
      isConnected,
      sessionTimeRemaining
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