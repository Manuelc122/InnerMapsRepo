export interface Subscription {
  id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: Date;
  createdAt: Date;
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'solid';
  badge?: string;
}