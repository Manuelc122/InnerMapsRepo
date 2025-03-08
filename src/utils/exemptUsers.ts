/**
 * Exempt Users Management
 * 
 * This module handles the management of users who are exempt from payment requirements.
 * In a real implementation, this would be stored in a database and managed through an admin interface.
 */

import { supabase } from './supabaseClient';

// List of users exempt from payment requirements
export const EXEMPT_USERS: string[] = [
  'admin@innermaps.co',
  'test@innermaps.co',
  // Add more exempt emails as needed
];

// Get the list of exempt users
export async function getExemptUsers(): Promise<string[]> {
  try {
    // In a real application, you might fetch this from a database
    // For now, we'll return the static list
    return [...EXEMPT_USERS];
  } catch (error) {
    console.error('Error getting exempt users:', error);
    throw error;
  }
}

// Add a user to the exempt list
export async function addExemptUser(email: string): Promise<void> {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Check if user is already exempt
    if (isUserExempt(email)) {
      throw new Error('User is already exempt');
    }

    // In a real application, you would update a database
    // For now, we'll just add to the in-memory array
    EXEMPT_USERS.push(email);
  } catch (error) {
    console.error('Error adding exempt user:', error);
    throw error;
  }
}

// Remove a user from the exempt list
export async function removeExemptUser(email: string): Promise<void> {
  try {
    // In a real application, you would update a database
    // For now, we'll just remove from the in-memory array
    const index = EXEMPT_USERS.findIndex(
      (e) => e.toLowerCase() === email.toLowerCase()
    );
    
    if (index !== -1) {
      EXEMPT_USERS.splice(index, 1);
    } else {
      throw new Error('User is not in the exempt list');
    }
  } catch (error) {
    console.error('Error removing exempt user:', error);
    throw error;
  }
}

// Check if a user is exempt based on their email
export function isUserExempt(email: string): boolean {
  if (!email) return false;
  return EXEMPT_USERS.some(
    (exemptEmail) => exemptEmail.toLowerCase() === email.toLowerCase()
  );
}

// Generate a secure ID for subscriptions
export const generateSubscriptionId = (): string => {
  return `sub_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

// Grant a free subscription to an exempt user
export const grantFreeSubscription = async (email: string, plan: 'monthly' | 'yearly' = 'yearly'): Promise<boolean> => {
  if (!email) {
    console.error('No email provided for free subscription');
    return false;
  }

  try {
    console.log(`Attempting to grant free ${plan} subscription to ${email}`);
    
    // Find the user by email
    const { data: userData, error: userError } = await supabase.auth.signInWithOtp({ email });
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      return false;
    }
    
    // Get the user's ID
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError || !user) {
      console.error('Error getting user:', getUserError);
      
      // If we can't find the user and the current user's email matches, use the current user
      if (user && user.email?.toLowerCase() === email.toLowerCase()) {
        console.log('Using current user for subscription');
      } else {
        console.error('User not found and current user does not match');
        return false;
      }
    }
    
    const userId = user?.id;
    
    if (!userId) {
      console.error('No user ID available');
      return false;
    }
    
    // Check if user already has a profile
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', profileError);
      // Continue anyway, we'll try to create the profile
    }
    
    // Create profile if it doesn't exist
    if (!existingProfile) {
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            created_at: new Date().toISOString(),
          },
        ]);
      
      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        // Continue anyway, the subscription might still work
      }
    }
    
    // Create a subscription record
    const subscriptionId = generateSubscriptionId();
    const now = new Date();
    const endDate = new Date();
    
    // Set end date based on plan
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([
        {
          id: subscriptionId,
          user_id: userId,
          status: 'active',
          plan_type: plan,
          created_at: now.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: false,
          payment_method: 'exempt',
        },
      ]);
    
    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return false;
    }
    
    console.log(`Successfully granted free ${plan} subscription to ${email}`);
    return true;
  } catch (error) {
    console.error('Error granting free subscription:', error);
    return false;
  }
};

// Check if a user has an active subscription (paid or free)
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    console.log(`Checking subscription status for user ID: ${userId}`);
    
    try {
      // First try to use the RPC function
      console.log('Attempting to check subscription via RPC');
      const { data, error } = await supabase.rpc('has_active_subscription', { user_id: userId });
      
      if (error) {
        console.error('Error checking subscription status with RPC:', error);
        console.log('Falling back to direct query for subscription check');
        // Fall back to direct query if RPC fails
        return await checkActiveSubscriptionDirectly(userId);
      }
      
      console.log('RPC subscription check result:', data);
      return data;
    } catch (rpcError) {
      console.error('Exception in RPC call:', rpcError);
      console.log('Falling back to direct query after RPC exception');
      // Fall back to direct query if RPC throws an exception
      return await checkActiveSubscriptionDirectly(userId);
    }
  } catch (err) {
    console.error('Error checking subscription status:', err);
    return false;
  }
}

// Helper function to check subscription directly from the database
async function checkActiveSubscriptionDirectly(userId: string): Promise<boolean> {
  try {
    console.log('Checking subscription directly from database');
    const now = new Date().toISOString();
    
    // First check for subscriptions with end date greater than now
    const { data: data1, error: error1 } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', now)
      .limit(1);
    
    if (error1) {
      console.error('Error checking subscription with end date:', error1);
      return false;
    }
    
    // If found a subscription, return true
    if (data1 && data1.length > 0) {
      console.log('Found active subscription with end date > now');
      return true;
    }
    
    // Otherwise check for subscriptions with null end date
    const { data: data2, error: error2 } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .is('current_period_end', null)
      .limit(1);
    
    if (error2) {
      console.error('Error checking subscription with null end date:', error2);
      return false;
    }
    
    const hasSubscription = data2 && data2.length > 0;
    console.log('Direct subscription check result:', hasSubscription);
    
    // If no subscription found, check if user is in exempt list
    if (!hasSubscription) {
      try {
        console.log('Checking if user is in exempt list');
        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user?.email) {
          console.error('Error getting user email:', userError);
          return false;
        }
        
        const userEmail = userData.user.email.toLowerCase();
        
        // Check if user is in exempt_users table
        const { data: exemptData, error: exemptError } = await supabase
          .from('exempt_users')
          .select('email')
          .eq('email', userEmail)
          .limit(1);
        
        if (exemptError) {
          console.error('Error checking exempt users:', exemptError);
          return false;
        }
        
        const isExempt = exemptData && exemptData.length > 0;
        console.log('User exempt status:', isExempt);
        return isExempt;
      } catch (exemptErr) {
        console.error('Error in exempt user check:', exemptErr);
        return false;
      }
    }
    
    return hasSubscription;
  } catch (err) {
    console.error('Exception checking subscription directly:', err);
    return false;
  }
}