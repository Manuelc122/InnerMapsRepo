import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './AuthContext';

interface UserNameContextType {
  firstName: string | null;
  isLoading: boolean;
  error: Error | null;
  refreshUserName: () => Promise<void>;
}

const UserNameContext = createContext<UserNameContextType | undefined>(undefined);

export function UserNameProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only fetch profile when auth is loaded and user exists
    if (!authLoading && user) {
      fetchUserName();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserName = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        // If error is "no rows returned", it means profile doesn't exist yet
        if (profileError.code === 'PGRST116') {
          // Use email as fallback
          if (user.email) {
            const emailName = user.email.split('@')[0];
            setFirstName(emailName);
          }
        } else {
          console.error('Error fetching user profile:', profileError);
          setError(new Error(`Failed to fetch profile: ${profileError.message}`));
        }
      } else if (profileData && profileData.full_name) {
        // Extract first name from full name
        const nameParts = profileData.full_name.split(' ');
        const firstName = nameParts[0] || null;
        setFirstName(firstName);
      } else if (user.email) {
        // Use email as fallback if no full name
        const emailName = user.email.split('@')[0];
        setFirstName(emailName);
      }
    } catch (err) {
      console.error('Error in fetchUserName:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user name'));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    firstName,
    isLoading,
    error,
    refreshUserName: fetchUserName
  };

  return (
    <UserNameContext.Provider value={value}>
      {children}
    </UserNameContext.Provider>
  );
}

export function useUserName() {
  const context = useContext(UserNameContext);
  if (context === undefined) {
    throw new Error('useUserName must be used within a UserNameProvider');
  }
  return context;
} 