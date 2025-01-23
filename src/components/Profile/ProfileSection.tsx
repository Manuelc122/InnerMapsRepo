import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { ErrorAlert } from '../ui/ErrorAlert';
import { getProfile, updateProfile } from '../../lib/profile';
import type { UserProfile, ProfileFormData } from '../../types/profile';

export function ProfileSection() {
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

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProfile = await updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-blue-100 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-50 rounded"></div>
          <div className="h-4 bg-blue-50 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50">
          <User className="w-5 h-5 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
      </div>

      {error && (
        <ErrorAlert 
          title="Profile Error" 
          message={error.message} 
        />
      )}

      <ProfileForm
        initialData={profile || undefined}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}