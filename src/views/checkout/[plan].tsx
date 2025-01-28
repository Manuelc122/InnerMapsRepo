import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import { SUBSCRIPTION_PLANS } from '../../utils/plans';

type PlanType = 'monthly' | 'yearly';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { plan: planParam } = useParams<{ plan: PlanType }>();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!planParam || !['monthly', 'yearly'].includes(planParam)) {
    navigate('/pricing');
    return null;
  }

  const selectedPlan = SUBSCRIPTION_PLANS[planParam];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Plan Details
          </h1>
          <div className="text-center">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedPlan.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  ${selectedPlan.priceInCents / 100}/{selectedPlan.period}
                </p>
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="text-gray-600">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 