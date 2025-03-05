import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import type { SubscriptionPlan } from '../../utils/plans';
import { WompiButton } from '../payment/WompiButton';
import { wompiService } from '../../utils/wompi';
import { useState } from 'react';

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  buttonText: string;
  buttonVariant: 'outline' | 'solid';
  plan: SubscriptionPlan;
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
  plan,
  badge
}: PricingCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert price from string (e.g., "$10") to cents (e.g., 1000)
  const getPriceInCents = (): number => {
    // Remove "$" and convert to number
    const numericPrice = parseFloat(price.replace('$', ''));
    // Convert to cents (multiply by 100)
    return Math.round(numericPrice * 100);
  };

  const handleSubscribe = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/auth/login?redirect=' + encodeURIComponent('/pricing'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // Generate a unique reference for this transaction
      const reference = wompiService.generateReference(user.id, plan);
      
      // Get the redirect URL
      const redirectUrl = wompiService.getRedirectUrl();
      
      // Reset processing state after a delay (in case the Wompi redirect doesn't happen)
      setTimeout(() => setIsProcessing(false), 5000);
      
      // The WompiButton component will handle the actual payment process
    } catch (error) {
      console.error('Error preparing payment:', error);
      setIsProcessing(false);
    }
  };

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
      
      {user ? (
        <WompiButton
          amount={getPriceInCents()}
          reference={wompiService.generateReference(user.id, plan)}
          redirectUrl={wompiService.getRedirectUrl()}
          buttonText={isProcessing ? 'Processing...' : buttonText}
          className={`
            w-full rounded-lg
            ${buttonVariant === 'solid' ? 'bg-blue-600' : 'bg-white border border-blue-200'}
            ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        />
      ) : (
        <button
          onClick={() => navigate('/auth/login?redirect=' + encodeURIComponent('/pricing'))}
          className={`
            w-full rounded-lg px-4 py-2.5 text-sm font-semibold leading-6 text-center
            ${
              buttonVariant === 'solid'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-blue-600 ring-1 ring-inset ring-blue-200 hover:bg-blue-50'
            }
          `}
        >
          Sign in to Subscribe
        </button>
      )}
    </div>
  );
} 