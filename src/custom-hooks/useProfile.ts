import { useState, useEffect } from 'react';
import { getProfile } from '../utils/profile';
import type { UserProfile } from '../interfaces/profile';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setError(null);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    error,
    refreshProfile: loadProfile
  };
}