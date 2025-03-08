import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import { updateUserSubscription } from '../../utils/stripeClient';
import { useSubscription } from '../../state-management/SubscriptionContext';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        console.log('PaymentSuccessPage: Processing payment success');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', location.search);
        
        // Get the plan from the URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const planParam = searchParams.get('plan');
        
        // Validate the plan parameter
        if (!planParam || (planParam !== 'monthly' && planParam !== 'yearly')) {
          console.error(`PaymentSuccessPage: Invalid plan parameter: ${planParam}`);
          setError(`Invalid subscription plan. Please contact support.`);
          setLoading(false);
          return;
        }
        
        const plan = planParam as 'monthly' | 'yearly';
        console.log('PaymentSuccessPage: Processing payment success for plan:', plan);
        
        // Ensure user is authenticated
        if (!user) {
          console.error('PaymentSuccessPage: No authenticated user found');
          setError('Please log in to complete your subscription setup.');
          setLoading(false);
          return;
        }
        
        console.log('PaymentSuccessPage: User authenticated, updating subscription for user ID:', user.id);
        
        // Update the user's profile with subscription information
        const updated = await updateUserSubscription(user.id, plan);
        
        if (updated) {
          console.log('PaymentSuccessPage: Successfully updated user subscription');
          // Refresh the subscription context to reflect the new subscription
          await refreshSubscription();
          setSuccess(true);
        } else {
          console.error('PaymentSuccessPage: Failed to update user subscription');
          setError('Your payment was successful, but we encountered an issue updating your account. Please contact support.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('PaymentSuccessPage: Error processing payment success:', err);
        setError('An error occurred while processing your payment. Please contact support.');
        setLoading(false);
      }
    };
    
    processPaymentSuccess();
  }, [location, user, navigate, refreshSubscription]);
  
  const handleContinue = () => {
    navigate('/journal');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {loading ? (
          <div className="py-8">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        ) : error ? (
          <div>
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to InnerMaps. Your account has been successfully activated.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Journaling
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 