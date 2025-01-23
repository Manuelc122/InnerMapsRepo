import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { updateProfile } from '../../lib/profile';
import type { UserProfile, ProfileFormData } from '../../types/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export function ProfileModal({ isOpen, onClose, profile }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateProfile(data);
      onClose();
      window.location.reload(); // Refresh to show updated profile
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error.message}
          </div>
        )}

        <ProfileForm
          initialData={profile}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}