import React, { useState, useEffect } from 'react';
import { User, Shield, Clock, AlertCircle, LogIn, RefreshCw } from 'lucide-react';
import { ProfileForm } from './ProfileForm';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../state-management/AuthContext';
import type { UserProfile, ProfileFormData } from '../../interfaces/profile';

export function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only attempt to load profile when auth is not loading and user exists
    if (!authLoading && user) {
      loadProfile();
    } else if (!authLoading && !user) {
      setIsLoading(false);
      setError(new Error('Authentication required. Please sign in to view your profile.'));
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if session is valid before attempting to load profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      // Directly fetch profile from Supabase instead of using the withAuth wrapper
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw new Error(`Failed to load profile: ${fetchError.message}`);
      }
      
      if (data) {
        // Log the actual data structure from the database to help debug
        console.log('Profile data from database:', data);
        
        // Extract first and last name from full_name
        const nameParts = data.full_name ? data.full_name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfile({
          id: data.id,
          userId: data.user_id,
          fullName: data.full_name || '',
          firstName: firstName,
          lastName: lastName,
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          country: data.country,
          gender: data.gender || null,
          createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
        });
      } else {
        // If no profile exists yet, create a default one
        const defaultProfile: UserProfile = {
          id: '',
          userId: session.user.id,
          fullName: session.user.email?.split('@')[0] || 'New User',
          firstName: session.user.email?.split('@')[0] || 'New',
          lastName: 'User',
          birthdate: null,
          country: null,
          gender: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      
      // Provide more specific error messages based on error type
      if (err instanceof Error) {
        if (err.message.includes('Authentication') || err.message.includes('session')) {
          setError(new Error('Authentication required. Please sign in again to view your profile.'));
        } else {
          setError(err);
        }
      } else {
        setError(new Error('Failed to load profile. Please try again later.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSaveSuccess(false);
      
      // Check if session is valid before attempting to update profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('Existing profile check:', existingProfile, fetchError);
      
      let updateError;
      
      // Log the data we're about to send to the database
      const profileData = {
        user_id: session.user.id,
        full_name: data.fullName,
        birthdate: data.birthdate,
        country: data.country,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating profile with data:', profileData);
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
        
        updateError = error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert(profileData);
        
        updateError = error;
      }
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      await loadProfile(); // Reload the profile after update
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Provide more specific error messages based on error type
      if (err instanceof Error) {
        if (err.message.includes('Authentication') || err.message.includes('session')) {
          setError(new Error('Authentication required. Please sign in again to update your profile.'));
        } else {
          setError(err);
        }
      } else {
        setError(new Error('Failed to update profile. Please try again later.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full"></div>
            <div className="h-8 bg-blue-100 rounded w-1/3"></div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Show authentication required message if not logged in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-700">Authentication Required</h3>
            <p className="text-yellow-600 mt-1">Please sign in to view and edit your profile.</p>
            <div className="mt-3 flex space-x-3">
              <button 
                onClick={() => window.location.href = '/'} 
                className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span>Sign In</span>
              </button>
              <button 
                onClick={() => window.location.href = '/auth-diagnostic'} 
                className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span>Run Auth Diagnostic</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while profile is being loaded
  if (isLoading && !profile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full"></div>
            <div className="h-8 bg-blue-100 rounded w-1/3"></div>
          </div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
            <User className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>
        </div>
        <p className="text-gray-600 ml-11">
          Manage your personal information and preferences
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Profile Error</h3>
            <p>{error.message}</p>
            {error.message.includes('Authentication') && (
              <div className="mt-2 flex space-x-3">
                <button 
                  onClick={() => window.location.reload()} 
                  className="inline-flex items-center text-red-700 hover:text-red-800"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span>Refresh Session</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/auth-diagnostic'} 
                  className="inline-flex items-center text-red-700 hover:text-red-800"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  <span>Run Auth Diagnostic</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Profile Updated</h3>
            <p>Your profile information has been successfully updated.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Last updated: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <ProfileForm
            initialData={profile || undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 text-center">
        Your profile information helps personalize your experience with InnerMaps
      </div>
    </div>
  );
}