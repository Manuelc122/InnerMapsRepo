import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import StripeCheckoutDisplay from '../../components/subscription/StripeCheckoutDisplay';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

type PlanType = 'monthly' | 'yearly';

export default function CheckoutPage() {
  const { plan: planParam } = useParams<{ plan: PlanType }>();
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!planParam || !['monthly', 'yearly'].includes(planParam)) {
    return <Navigate to="/pricing" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <StripeCheckoutDisplay plan={planParam as PlanType} />
    </div>
  );
} 