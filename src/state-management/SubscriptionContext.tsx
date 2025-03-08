import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabaseClient';

// TEMPORARY: Set this to false to enforce subscription checks
const BYPASS_SUBSCRIPTION_CHECK = false;

// List of emails that are exempt from subscription requirements
const EXEMPT_EMAILS = ['admin@innermaps.co', 'test@innermaps.co', 'manueldavic@hotmail.com'];

interface Subscription {
  id: string;
  status: string;
  planType: 'monthly' | 'yearly';
  currentPeriodEnd: Date | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Function to check if a user has an active subscription directly from the database
  const checkActiveSubscription = async (userId: string): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .or(`current_period_end.gt.${now},current_period_end.is.null`)
        .limit(1);
      
      if (error) {
        console.error('Error checking subscription directly:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (err) {
      console.error('Exception checking subscription directly:', err);
      return false;
    }
  };

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setHasActiveSubscription(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if user's email is in the exempt list
      const isExemptUser = user.email && EXEMPT_EMAILS.some(
        email => email.toLowerCase() === user.email?.toLowerCase()
      );

      // BYPASS: If bypass is enabled or user is exempt, set hasSubscription to true without checking
      if (BYPASS_SUBSCRIPTION_CHECK || isExemptUser) {
        console.log('BYPASSING subscription check for user:', user.email);
        setHasActiveSubscription(true);
        setSubscription({
          id: 'bypass-subscription',
          status: 'active',
          planType: 'yearly',
          currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        });
        setIsLoading(false);
        return;
      }

      let hasSubscription = false;

      try {
        // First try to use the RPC function
        console.log('Attempting to check subscription via RPC for user:', user.id);
        const { data, error: hasSubError } = await supabase
          .rpc('has_active_subscription', { user_id: user.id });

        if (hasSubError) {
          console.error('Error checking subscription status with RPC:', hasSubError);
          console.log('Falling back to direct database query for subscription check');
          // If RPC fails, fall back to direct query
          hasSubscription = await checkActiveSubscription(user.id);
        } else {
          console.log('RPC subscription check successful, result:', data);
          hasSubscription = data;
        }
      } catch (rpcError) {
        console.error('Exception in RPC call:', rpcError);
        console.log('Falling back to direct database query after RPC exception');
        // If RPC throws an exception, fall back to direct query
        hasSubscription = await checkActiveSubscription(user.id);
      }

      // For testing in admin dashboard, check if user is in exempt list
      if (!hasSubscription && user.email) {
        try {
          const { data: exemptData } = await supabase
            .from('exempt_users')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .limit(1);
          
          if (exemptData && exemptData.length > 0) {
            console.log('User is in exempt list, granting subscription access');
            hasSubscription = true;
          }
        } catch (exemptError) {
          console.error('Error checking exempt users:', exemptError);
        }
      }

      setHasActiveSubscription(hasSubscription);
      console.log('Final subscription status:', hasSubscription);

      // If they have an active subscription, fetch the details
      if (hasSubscription) {
        const { data, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Error fetching subscription details:', fetchError);
          setError('Failed to fetch subscription details');
          // Even if we can't get details, we know they have a subscription
          setSubscription({
            id: 'unknown',
            status: 'active',
            planType: 'yearly',
            currentPeriodEnd: null
          });
        } else if (data) {
          setSubscription({
            id: data.id,
            status: data.status,
            planType: data.plan_type || 'yearly',
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null
          });
        }
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Unexpected error in subscription check:', err);
      setError('An unexpected error occurred while checking your subscription');
      setSubscription(null);
      setHasActiveSubscription(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        hasActiveSubscription,
        refreshSubscription: fetchSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 