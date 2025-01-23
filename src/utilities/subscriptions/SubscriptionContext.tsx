import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SubscriptionService } from './subscriptionService';
import { SubscriptionLimits } from './types';

interface SubscriptionContextType {
  limits: SubscriptionLimits;
  canCreateNewEntry: boolean;
  isLoading: boolean;
  error: string | null;
  checkEntryLimit: () => Promise<boolean>;
  incrementEntryCount: () => Promise<void>;
  decrementEntryCount: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [canCreateNewEntry, setCanCreateNewEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriptionService = SubscriptionService.getInstance();

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  async function loadSubscriptionData() {
    try {
      setIsLoading(true);
      await subscriptionService.initialize(user!.id);
      setLimits(subscriptionService.getCurrentLimits());
      const canCreate = await subscriptionService.canCreateNewEntry(user!.id);
      setCanCreateNewEntry(canCreate);
    } catch (err) {
      setError('Failed to load subscription data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkEntryLimit(): Promise<boolean> {
    if (!user) return false;
    const canCreate = await subscriptionService.canCreateNewEntry(user.id);
    setCanCreateNewEntry(canCreate);
    return canCreate;
  }

  async function incrementEntryCount() {
    if (!user) return;
    await subscriptionService.incrementEntryCount(user.id);
    await loadSubscriptionData();
  }

  async function decrementEntryCount() {
    if (!user) return;
    await subscriptionService.decrementEntryCount(user.id);
    await loadSubscriptionData();
  }

  return (
    <SubscriptionContext.Provider
      value={{
        limits: limits || subscriptionService.getCurrentLimits(),
        canCreateNewEntry,
        isLoading,
        error,
        checkEntryLimit,
        incrementEntryCount,
        decrementEntryCount,
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