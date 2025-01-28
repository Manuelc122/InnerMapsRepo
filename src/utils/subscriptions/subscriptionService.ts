import { supabase } from '../supabaseClient';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from './types';

export class SubscriptionService {
  private static instance: SubscriptionService;
  private currentTier: SubscriptionTier = 'free';
  private entryCount: number = 0;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async initialize(userId: string) {
    // Get user's subscription tier from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, entry_count')
      .eq('id', userId)
      .single();

    if (profile) {
      this.currentTier = (profile.subscription_tier as SubscriptionTier) || 'free';
      this.entryCount = profile.entry_count || 0;
    }
  }

  getCurrentLimits() {
    return SUBSCRIPTION_LIMITS[this.currentTier];
  }

  async canCreateNewEntry(userId: string): Promise<boolean> {
    await this.initialize(userId);
    const limits = this.getCurrentLimits();
    return this.entryCount < limits.maxJournalEntries;
  }

  hasAdvancedAI(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasAdvancedAI;
  }

  hasVoiceJournaling(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasVoiceJournaling;
  }

  hasAICoaching(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasAICoaching;
  }

  hasPrioritySupport(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasPrioritySupport;
  }

  hasEarlyAccess(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasEarlyAccess;
  }

  hasPersonalizedInsights(): boolean {
    return SUBSCRIPTION_LIMITS[this.currentTier].hasPersonalizedInsights;
  }

  async incrementEntryCount(userId: string): Promise<void> {
    this.entryCount++;
    await supabase
      .from('profiles')
      .update({ entry_count: this.entryCount })
      .eq('id', userId);
  }

  async decrementEntryCount(userId: string): Promise<void> {
    this.entryCount = Math.max(0, this.entryCount - 1);
    await supabase
      .from('profiles')
      .update({ entry_count: this.entryCount })
      .eq('id', userId);
  }
} 