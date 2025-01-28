export type SubscriptionPlan = 'monthly' | 'yearly';

export const SUBSCRIPTION_PLANS = {
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
    ],
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
    ],
    buttonText: 'Start Yearly Plan',
    buttonVariant: 'solid',
    badge: 'Best Value'
  }
} as const;

export type SubscriptionPlanId = keyof typeof SUBSCRIPTION_PLANS; 