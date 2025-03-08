import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import { STRIPE_PLANS, redirectToPaymentLink } from '../../utils/stripeClient';
import { Logo } from '../shared/Logo';

export default function StripeCheckoutDisplay({ plan = 'monthly' }: { plan?: 'monthly' | 'yearly' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>(plan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoBack = () => {
    window.location.replace('/');
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate user is logged in
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Validate plan selection
      if (!activePlan || !STRIPE_PLANS[activePlan]) {
        setError('Invalid plan selected. Please try again.');
        setLoading(false);
        return;
      }
      
      console.log('Redirecting to payment link for plan:', activePlan);
      
      // Redirect to the payment link for the selected plan
      redirectToPaymentLink(activePlan, user.id, user.email);
      
    } catch (error) {
      console.error('Error redirecting to payment:', error);
      setError('Failed to start checkout process. Please try again.');
      setLoading(false);
    }
  };

  const selectedPlan = STRIPE_PLANS[activePlan];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="w-full py-4 px-6 flex justify-between items-center bg-white shadow-sm">
        <Logo />
        <button 
          onClick={handleGoBack}
          className="text-gray-600 hover:text-gray-900"
        >
          Back to Home
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {selectedPlan.name}
            </h2>
            <p className="text-blue-100">
              ${selectedPlan.price}/{selectedPlan.period}
            </p>
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">What's included:</h3>
            <ul className="space-y-2 mb-6">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : `Subscribe for $${selectedPlan.price}/${selectedPlan.period}`}
              </button>
              
              <div className="text-center text-sm text-gray-500">
                Secure payment powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 