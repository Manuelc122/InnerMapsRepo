import React from 'react';
import { useSubscription } from '../../lib/subscriptions/SubscriptionContext';
import { useRouter } from 'next/router';

interface SubscriptionLimitAlertProps {
  feature: 'entries' | 'ai' | 'voice' | 'coaching' | 'support' | 'early_access' | 'insights';
  children: React.ReactNode;
}

export function SubscriptionLimitAlert({ feature, children }: SubscriptionLimitAlertProps) {
  const { limits, canCreateNewEntry } = useSubscription();
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const checkFeatureAccess = () => {
    switch (feature) {
      case 'entries':
        return canCreateNewEntry;
      case 'ai':
        return limits.hasAdvancedAI;
      case 'voice':
        return limits.hasVoiceJournaling;
      case 'coaching':
        return limits.hasAICoaching;
      case 'support':
        return limits.hasPrioritySupport;
      case 'early_access':
        return limits.hasEarlyAccess;
      case 'insights':
        return limits.hasPersonalizedInsights;
      default:
        return false;
    }
  };

  const getFeatureMessage = () => {
    switch (feature) {
      case 'entries':
        return 'Upgrade to create unlimited journal entries';
      case 'ai':
        return 'Upgrade to access advanced AI insights';
      case 'voice':
        return 'Upgrade to use voice journaling';
      case 'coaching':
        return 'Upgrade to chat with AI coach';
      case 'support':
        return 'Upgrade to get priority support';
      case 'early_access':
        return 'Upgrade to get early access to new features';
      case 'insights':
        return 'Upgrade to get personalized insights';
      default:
        return 'Upgrade to access this feature';
    }
  };

  if (checkFeatureAccess()) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-gray-600">{getFeatureMessage()}</p>
        <button
          onClick={handleUpgrade}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
} 