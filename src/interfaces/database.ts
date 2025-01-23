export interface SubscriptionPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'solid';
  badge?: string;
}

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: '$10',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Unlimited journal entries',
      'Advanced AI insights',
      'Voice journaling',
      'AI coaching conversations'
    ],
    buttonText: 'Get Started Monthly',
    buttonVariant: 'outline' as const
  },
  yearly: {
    name: 'Yearly Plan',
    price: '$100',
    period: '/year',
    description: 'Save 17% with annual billing',
    features: [
      'Everything in Monthly',
      'Priority support',
      'Early access to new features',
      'Personalized insights'
    ],
    buttonText: 'Get Started Yearly',
    buttonVariant: 'solid' as const,
    badge: 'BEST VALUE'
  }
} as const;