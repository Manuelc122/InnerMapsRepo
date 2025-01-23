import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { SUBSCRIPTION_PLANS } from '../../lib/plans';
import { createCheckoutSession } from '../../lib/stripe';

type PlanType = 'monthly' | 'yearly';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const planParam = (router.query?.plan || '') as PlanType;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const initCheckout = async () => {
      if (!planParam || !['monthly', 'yearly'].includes(planParam)) {
        router.push('/pricing');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const priceId = planParam === 'monthly' ? 'price_monthly' : 'price_yearly';
        await createCheckoutSession(priceId);
      } catch (err) {
        console.error('Checkout error:', err);
        setError('Failed to initialize checkout. Please try again.');
        setIsLoading(false);
      }
    };

    if (user && planParam) {
      initCheckout();
    }
  }, [user, planParam, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedPlan = planParam && SUBSCRIPTION_PLANS[planParam];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isLoading ? 'Preparing Checkout...' : 'Checkout'}
          </h1>

          {error ? (
            <div className="text-center">
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Pricing
              </button>
            </div>
          ) : (
            <div className="text-center">
              {selectedPlan ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">{selectedPlan.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      ${selectedPlan.priceInCents / 100}{selectedPlan.period}
                    </p>
                  </div>
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600">
                    Please wait while we prepare your checkout session...
                  </p>
                </div>
              ) : (
                <div className="text-gray-600">
                  Invalid plan selected. Please return to pricing page.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 