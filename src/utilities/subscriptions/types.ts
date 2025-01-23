export type SubscriptionTier = 'monthly';

export interface SubscriptionLimits {
  maxJournalEntries: number;
  hasAdvancedAI: boolean;
  hasVoiceJournaling: boolean;
  hasAICoaching: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  monthly: {
    maxJournalEntries: Infinity,
    hasAdvancedAI: true,
    hasVoiceJournaling: true,
    hasAICoaching: true,
  },
}; 