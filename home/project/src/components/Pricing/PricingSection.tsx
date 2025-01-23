import React from 'react';
import { Check } from 'lucide-react';
import { PricingCard } from './PricingCard';

export function PricingSection() {
  const plans = [
    {
      name: 'Monthly',
      price: '$10',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Unlimited journal entries',
        'AI-powered insights',
        'Progress tracking'
      ],
      buttonText: 'Get Started Monthly',
      buttonVariant: 'outline'
    },
    {
      name: 'Yearly',
      price: '$100',
      period: '/year',
      description: 'Save 17% with annual billing',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics'
      ],
      buttonText: 'Get Started Yearly',
      buttonVariant: 'solid',
      badge: 'BEST VALUE'
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that works best for your journey of self-discovery
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}