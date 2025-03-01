import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../state-management/AuthContext';

/**
 * Custom hook to get the user's first name from their profile
 * @returns An object containing the user's first name and loading state
 */
export function useUserName() {
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

  return {
    firstName,
    isLoading,
    error,
    refreshUserName: fetchUserName
  };
} 