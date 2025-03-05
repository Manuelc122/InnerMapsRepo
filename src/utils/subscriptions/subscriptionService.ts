import { supabase } from '../supabaseClient';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from './types';
import { payuService } from '../payu';

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

  /**
   * Create a PayU checkout session for subscription
   * @param planId The ID of the subscription plan
   * @param amount The amount to charge (in dollars)
   * @param currency The currency code (default: USD)
   * @param description Description of the subscription
   * @returns The checkout data needed for PayU form submission
   */
  async createPayUCheckoutSession(
    planId: string,
    amount: number,
    currency: string = 'USD',
    description?: string
  ): Promise<any> {
    try {
      // Convert amount to cents for API
      const amountInCents = Math.round(amount * 100);
      
      const { data, error } = await supabase.functions.invoke('create-payu-checkout', {
        body: {
          planId,
          amount: amountInCents / 100, // Convert back to dollars for PayU
          currency,
          description: description || `InnerMaps ${planId} Subscription`
        }
      });

      if (error) {
        console.error('Error creating PayU checkout session:', error);
        throw new Error(error.message);
      }

      return data.checkoutData;
    } catch (error) {
      console.error('Error in createPayUCheckoutSession:', error);
      throw error;
    }
  }

  /**
   * Process a subscription with PayU directly
   * @param planId The ID of the subscription plan
   * @param amount The amount to charge (in dollars)
   * @param redirectUrl The URL to redirect to after payment
   * @returns The reference code for the transaction
   */
  async processSubscriptionWithPayU(
    planId: string,
    amount: number,
    redirectUrl: string
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate a unique reference code
      const reference = payuService.generateReference(user.id, planId);
      
      // Create a PayU button programmatically and click it
      const payuFormData = {
        merchantId: payuService.getMerchantId(),
        accountId: payuService.getAccountId(),
        description: `InnerMaps ${planId} Subscription`,
        referenceCode: reference,
        amount: amount.toFixed(2),
        tax: "0.00",
        taxReturnBase: "0.00",
        currency: "USD",
        signature: payuService.generateSignature(reference, amount, "USD"),
        test: "0", // 0 for production, 1 for test
        buyerEmail: user.email || "customer@example.com",
        responseUrl: redirectUrl,
        confirmationUrl: `${window.location.origin}/api/payment-confirmation`,
      };

      // Create and submit a form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuService.getCheckoutUrl();
      form.style.display = 'none';
      
      // Add all parameters as hidden inputs
      Object.entries(payuFormData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });
      
      // Add form to body and submit
      document.body.appendChild(form);
      form.submit();
      
      return reference;
    } catch (error) {
      console.error('Error processing subscription with PayU:', error);
      throw error;
    }
  }
} 