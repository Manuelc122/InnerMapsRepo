import { supabase } from './supabase';
import { withAuth } from './api';
import type { UserProfile, ProfileFormData } from '../types/profile';

export async function getProfile(): Promise<UserProfile | null> {
  return withAuth(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data ? {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
      country: data.country,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } : null;
  });
}

export async function updateProfile(profile: ProfileFormData): Promise<void> {
  return withAuth(async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: profile.fullName,
        birthdate: profile.birthdate,
        country: profile.country,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  });
}