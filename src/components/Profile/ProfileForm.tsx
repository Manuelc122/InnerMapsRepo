import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { UserProfile, ProfileFormData } from '../../types/profile';

interface ProfileFormProps {
  initialData?: UserProfile | null;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: initialData?.fullName || '',
    birthdate: initialData?.birthdate 
      ? new Date(initialData.birthdate).toISOString().split('T')[0]
      : '',
    country: initialData?.country || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.birthdate || !formData.country) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
      </div>

      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
          Birthdate
        </label>
        <input
          type="date"
          id="birthdate"
          value={formData.birthdate}
          onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <input
          type="text"
          id="country"
          value={formData.country}
          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Save className="w-4 h-4" />
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}