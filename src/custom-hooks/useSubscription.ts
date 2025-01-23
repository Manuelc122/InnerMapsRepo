import { useState, useEffect } from 'react';
import { getSubscription, createSubscription } from '../lib/subscription';
import { useAuth } from '../contexts/AuthContext';
import type { Subscription } from '../types/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Only load subscription if user is authenticated
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setError(null);
      const data = await getSubscription();
      setSubscription(data);
    } catch (err) {
      // Don't show auth errors to the user since they're expected when not logged in
      if (err instanceof Error && err.name !== 'AuthError') {
        setError(err);
        console.error('Error loading subscription:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      throw new Error('Must be logged in to subscribe');
    }

    try {
      setIsLoading(true);
      setError(null);
      const newSubscription = await createSubscription(plan);
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create subscription');
      setError(error);
      console.error('Error creating subscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscription,
    isLoading,
    error,
    subscribe,
    refreshSubscription: loadSubscription
  };
}