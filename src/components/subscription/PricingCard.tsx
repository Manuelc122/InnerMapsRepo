import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import type { SubscriptionPlan } from '../lib/plans';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'solid';
  badge?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  badge
}: PricingCardProps) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-gray-200 p-8 shadow-sm">
      {badge && (
        <p className="absolute -top-4 right-8 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
          {badge}
        </p>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold leading-5">{name}</h3>
        <p className="mt-4 text-sm text-gray-700">{description}</p>
        <p className="mt-8">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          <span className="text-base font-medium text-gray-500">/{period}</span>
        </p>
      </div>
      <ul role="list" className="mb-10 flex flex-1 flex-col gap-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <svg
              className="h-6 w-6 flex-none text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`
          w-full rounded-lg px-4 py-2.5 text-sm font-semibold leading-6 text-center cursor-not-allowed opacity-50
          ${
            buttonVariant === 'solid'
              ? 'bg-blue-600 text-white'
              : 'text-blue-600 ring-1 ring-inset ring-blue-200'
          }
        `}
        disabled
      >
        Coming Soon
      </button>
    </div>
  );
} 