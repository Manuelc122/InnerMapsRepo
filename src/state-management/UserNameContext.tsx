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

      console.log('Fetching user profile for user ID:', user.id);

      // Fetch profile from Supabase with explicit headers
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', {
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code
        });

        // If error is "no rows returned", it means profile doesn't exist yet
        if (profileError.code === 'PGRST116' || profileError.message?.includes('no rows')) {
          console.log('No profile found, creating a new profile');
          
          try {
            // Create a new profile
            const { data: insertData, error: insertError } = await supabase
              .from('profiles')
              .insert([
                { 
                  user_id: user.id, 
                  full_name: user.email ? user.email.split('@')[0] : 'User',
                  email: user.email
                }
              ])
              .select('full_name')
              .single();
            
            if (insertError) {
              console.error('Failed to create profile:', insertError);
              // Use email as fallback
              if (user.email) {
                const emailName = user.email.split('@')[0];
                setFirstName(emailName);
                console.log('Using email as fallback name:', emailName);
              }
            } else if (insertData) {
              console.log('Profile created successfully:', insertData);
              const nameParts = insertData.full_name.split(' ');
              setFirstName(nameParts[0] || null);
            }
          } catch (createError) {
            console.error('Error creating profile:', createError);
            // Use email as fallback
            if (user.email) {
              const emailName = user.email.split('@')[0];
              setFirstName(emailName);
              console.log('Using email as fallback name after error:', emailName);
            }
          }
        } else {
          // For other errors, try a direct fetch with explicit headers
          try {
            console.log('Attempting direct fetch with explicit headers');
            
            // Try a direct fetch with explicit headers
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=full_name&user_id=eq.${user.id}`,
              {
                method: 'GET',
                headers: {
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Prefer': 'return=representation'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0 && data[0].full_name) {
                console.log('Profile found via direct fetch:', data[0]);
                const nameParts = data[0].full_name.split(' ');
                setFirstName(nameParts[0] || null);
              } else {
                throw new Error('No profile data returned from direct fetch');
              }
            } else {
              throw new Error(`Direct fetch failed with status: ${response.status}`);
            }
          } catch (directFetchError) {
            console.error('Direct fetch failed:', directFetchError);
            
            // Create a profile as a last resort
            try {
              console.log('Creating profile as last resort');
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  { 
                    user_id: user.id, 
                    full_name: user.email ? user.email.split('@')[0] : 'User',
                    email: user.email
                  }
                ]);
              
              if (insertError) {
                console.error('Failed to create profile as last resort:', insertError);
              } else {
                console.log('Profile created successfully as last resort');
              }
              
              // Use email as fallback regardless
              if (user.email) {
                const emailName = user.email.split('@')[0];
                setFirstName(emailName);
                console.log('Using email as fallback after all attempts:', emailName);
              }
            } catch (finalError) {
              console.error('Final attempt to create profile failed:', finalError);
              // Use email as absolute last resort
              if (user.email) {
                const emailName = user.email.split('@')[0];
                setFirstName(emailName);
              }
            }
          }
        }
      } else if (profileData && profileData.full_name) {
        console.log('Profile found:', profileData);
        // Extract first name from full name
        const nameParts = profileData.full_name.split(' ');
        const firstName = nameParts[0] || null;
        setFirstName(firstName);
      } else if (user.email) {
        console.log('No full name found, using email as fallback');
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