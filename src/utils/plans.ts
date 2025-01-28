export type SubscriptionPlan = 'monthly' | 'yearly';
export type ButtonVariant = 'outline' | 'solid';

interface PlanDetails {
  readonly name: string;
  readonly priceInCents: number;
  readonly period: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly buttonText: string;
  readonly buttonVariant: ButtonVariant;
  readonly badge?: string;
}

export const SUBSCRIPTION_PLANS: Readonly<Record<SubscriptionPlan, PlanDetails>> = {
  monthly: {
    name: 'Monthly Plan',
    priceInCents: 1000000, // $10 USD in cents
    period: 'month',
    description: 'Perfect for trying out our premium features',
    features: [
      'Unlimited journal entries',
      'Advanced AI insights',
      'Voice journaling',
      'AI coaching conversations'
    ] as const,
    buttonText: 'Start Monthly Plan',
    buttonVariant: 'outline'
  },
  yearly: {
    name: 'Yearly Plan',
    priceInCents: 10000000, // $100 USD in cents
    period: 'year',
    description: 'Best value for committed journalers',
    features: [
      'All monthly features',
      'Priority support',
      'Early access to new features',
      'Personalized insights',
      '17% savings vs monthly'
    ] as const,
    buttonText: 'Start Yearly Plan',
    buttonVariant: 'solid',
    badge: 'Most Popular'
  }
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS; 