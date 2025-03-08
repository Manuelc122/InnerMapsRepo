import React, { useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { redirectToPaymentLink } from '../../utils/stripeClient';

interface StripeCheckoutButtonProps {
  priceId: string;
  buttonText: string;
  className?: string;
  disabled?: boolean;
  planType: 'monthly' | 'yearly';
}

export function StripeCheckoutButton({
  priceId,
  buttonText,
  className = '',
  disabled = false,
  planType
}: StripeCheckoutButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      console.error('User must be logged in to checkout');
      return;
    }

    try {
      setLoading(true);
      
      // Redirect to the Stripe payment link
      redirectToPaymentLink(planType, user.id, user.email);
      
    } catch (err) {
      console.error('Error redirecting to payment link:', err);
      alert('Failed to start checkout process. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="stripe-checkout-button-container">
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={`stripe-checkout-button ${className} w-full py-3 px-4 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
} 