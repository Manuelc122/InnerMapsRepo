import React, { useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { SubscriptionService } from '../../utils/subscriptions/subscriptionService';

interface PayUCheckoutButtonProps {
  planId: string;
  amount: number;
  currency?: string;
  buttonText?: string;
  className?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: Error) => void;
}

export function PayUCheckoutButton({
  planId,
  amount,
  currency = 'USD',
  buttonText = 'Subscribe Now',
  className = '',
  onSuccess,
  onError
}: PayUCheckoutButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const subscriptionService = SubscriptionService.getInstance();
  
  const handleCheckout = async () => {
    if (!user) {
      setError('You must be logged in to subscribe');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the redirect URL for after payment
      const redirectUrl = `${window.location.origin}/payment/result`;
      
      // Process the subscription with PayU
      const reference = await subscriptionService.processSubscriptionWithPayU(
        planId,
        amount,
        redirectUrl
      );
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(reference);
      }
    } catch (err) {
      console.error('Error processing PayU checkout:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Call the error callback if provided
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="payu-checkout-button-container">
      <button
        onClick={handleCheckout}
        disabled={isLoading || !user}
        className={`payu-checkout-button ${className} w-full py-3 px-4 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
      
      {error && (
        <div className="error-message mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
      
      {!user && (
        <div className="mt-2 text-sm text-gray-500">
          Please log in to subscribe.
        </div>
      )}
    </div>
  );
} 