import React from 'react';
import { Check } from 'lucide-react';

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
    <div className={`relative bg-white rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg ${
      buttonVariant === 'solid' ? 'border-2 border-blue-500' : 'border border-gray-200'
    }`}>
      {badge && (
        <div className="absolute top-0 right-6 -translate-y-1/2">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        
        <div className="flex items-baseline mb-8">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          className={`w-full py-3 px-6 rounded-lg transition-colors ${
            buttonVariant === 'solid'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}