import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';
import { STRIPE_PLANS, redirectToPaymentLink } from '../../utils/stripeClient';

/**
 * This component displays subscription plan options for users to choose from.
 * It's used when a user doesn't have an active subscription.
 */
export default function SubscriptionPlanSelector() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Selected plan: ${plan}`);
      console.log(`Plan object:`, STRIPE_PLANS[plan]);
      console.log(`Payment link for ${plan} plan:`, STRIPE_PLANS[plan].paymentLink);
      
      // Set a specific loading state for the selected plan
      if (plan === 'monthly') {
        setLoading(true);
        console.log('Processing MONTHLY plan selection...');
      } else if (plan === 'yearly') {
        setLoading(true);
        console.log('Processing YEARLY plan selection...');
      }
      
      // Redirect to the payment link for the selected plan
      redirectToPaymentLink(plan, user.id, user.email);
    } catch (err) {
      console.error('Error redirecting to payment link:', err);
      setError('Failed to redirect to payment page. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Choose Your Subscription Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select a plan that works best for you to unlock all features
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative transition-all duration-300 hover:shadow-2xl">
            {/* Monthly Plan Top Bar */}
            <div className="text-center py-3 bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">
              <span className="inline-block px-6 py-2 text-white text-sm font-medium">
                Flexible Monthly Billing
              </span>
            </div>
            
            <div className="px-8 pt-8 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {STRIPE_PLANS.monthly.name}
              </h3>
              <p className="text-center text-gray-600 mb-8">
                All the tools you need for self-discovery
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">${STRIPE_PLANS.monthly.price}</span>
                  <span className="text-gray-500 ml-2">/{STRIPE_PLANS.monthly.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {STRIPE_PLANS.monthly.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('monthly')}
                disabled={loading}
                className="group block w-full py-4 px-8 text-center text-white bg-gradient-to-r from-[#4461F2] to-[#7E87FF] rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <>
                    Subscribe Monthly
                    <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-indigo-200 relative transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-subtle-pulse">
            {/* Best Value Badge */}
            <div className="text-center py-3 bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">
              <span className="inline-block px-6 py-2 text-white text-sm font-medium">
                Best Value - 2 Months Free!
              </span>
            </div>

            <div className="px-8 pt-6 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {STRIPE_PLANS.yearly.name}
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Pay for 10 months, get 12 months access
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">${STRIPE_PLANS.yearly.price}</span>
                  <span className="text-gray-500 ml-2">/{STRIPE_PLANS.yearly.period}</span>
                </div>
                <div className="text-sm font-medium mt-2 bg-clip-text text-transparent bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">
                  That's just $10/month - 2 months free!
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {STRIPE_PLANS.yearly.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('yearly')}
                disabled={loading}
                className="group block w-full py-4 px-8 text-center text-white bg-gradient-to-r from-[#4461F2] to-[#7E87FF] rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg"
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
                  <>
                    Subscribe Yearly
                    <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 