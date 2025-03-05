import React, { useEffect, useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { PayUButton } from './PayUButton';
import { payuService } from '../../utils/payu';

// Props for the DirectPaymentRedirect component
interface DirectPaymentRedirectProps {
  amount?: number; // Amount in cents (default: 1200 USD = $12.00 USD)
  autoOpen?: boolean; // Whether to automatically open the payment widget
}

// DirectPaymentRedirect component
export function DirectPaymentRedirect({ 
  amount = 1200, // This is in USD cents ($12.00 USD)
  autoOpen = false
}: DirectPaymentRedirectProps) {
  const { user } = useAuth();
  const [reference, setReference] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasOpenedPayment, setHasOpenedPayment] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set up event listener for beforeunload
  useEffect(() => {
    if (hasOpenedPayment) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [hasOpenedPayment]);

  // Set up payment when component mounts
  useEffect(() => {
    setupPayment();
  }, [user]);

  // Set up payment details
  const setupPayment = async () => {
    try {
      if (!user) {
        console.error('User not authenticated');
        setError('You must be logged in to make a payment.');
        return;
      }

      // Generate a unique reference for this transaction
      const plan = amount === 1200 ? 'monthly' : 'yearly';
      const newReference = payuService.generateReference(user.id, plan);
      setReference(newReference);

      // Get the redirect URL
      const newRedirectUrl = payuService.getRedirectUrl();
      setRedirectUrl(newRedirectUrl);

      // Mark as ready
      setIsReady(true);
      setError(null);

      console.log('Payment setup complete:', {
        reference: newReference,
        redirectUrl: newRedirectUrl,
        amount,
        plan
      });
    } catch (error) {
      console.error('Error setting up payment:', error);
      setError('Failed to set up payment. Please try again.');
      setIsReady(false);
    }
  };

  // Handle beforeunload event to warn user about leaving
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const message = 'Your payment is being processed. Are you sure you want to leave?';
    e.returnValue = message;
    return message;
  };

  // Handle payment open event
  const handlePaymentOpen = () => {
    console.log('Payment opened');
    setHasOpenedPayment(true);
    
    // Store in session storage that payment has been initiated
    sessionStorage.setItem('paymentInitiated', 'true');
    sessionStorage.setItem('paymentReference', reference);
  };

  // Handle manual retry
  const handleRetry = () => {
    setIsReady(false);
    setError(null);
    setupPayment();
  };

  // If not ready, show loading
  if (!isReady || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg">Setting up payment...</p>
          </>
        )}
      </div>
    );
  }

  // Format amount for display
  const formattedAmount = (amount / 100).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mb-8">
        <h3 className="text-xl font-semibold mb-4">InnerMaps Subscription</h3>
        <p className="text-gray-600 mb-6">
          You're about to pay <span className="font-bold">${formattedAmount} USD</span> for your subscription.
        </p>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Transaction Reference:</p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">{reference}</p>
        </div>
        
        <PayUButton
          amount={amount}
          reference={reference}
          redirectUrl={redirectUrl}
          buttonText="Complete Payment"
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          autoOpen={autoOpen}
          onPaymentOpen={handlePaymentOpen}
          description="InnerMaps Subscription"
          currency="USD"
        />
        
        {/* Debug information in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-left text-gray-500 border-t pt-4">
            <p><strong>Debug Info:</strong></p>
            <p>Amount: {amount} cents (${formattedAmount} USD)</p>
            <p>Reference: {reference}</p>
            <p>Redirect URL: {redirectUrl}</p>
            <p>User ID: {user?.id}</p>
            <p>PayU Initialized: {payuService.isInitialized() ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 max-w-md">
        <p>You will be redirected to our secure payment provider to complete your payment.</p>
        <p className="mt-2">After payment, you'll be returned to InnerMaps automatically.</p>
      </div>
    </div>
  );
} 