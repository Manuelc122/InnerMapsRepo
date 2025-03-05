export type SubscriptionTier = 'free' | 'monthly';

export interface SubscriptionLimits {
  maxJournalEntries: number;
  hasAdvancedAI: boolean;
  hasVoiceJournaling: boolean;
  hasAICoaching: boolean;
  hasPrioritySupport: boolean;
  hasEarlyAccess: boolean;
  hasPersonalizedInsights: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxJournalEntries: 10,
    hasAdvancedAI: false,
    hasVoiceJournaling: false,
    hasAICoaching: false,
    hasPrioritySupport: false,
    hasEarlyAccess: false,
    hasPersonalizedInsights: false,
  },
  monthly: {
    maxJournalEntries: Infinity,
    hasAdvancedAI: true,
    hasVoiceJournaling: true,
    hasAICoaching: true,
    hasPrioritySupport: true,
    hasEarlyAccess: true,
    hasPersonalizedInsights: true,
  },
}; 