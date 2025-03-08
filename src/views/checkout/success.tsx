import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import StripeCheckoutDisplay from '../../components/subscription/StripeCheckoutDisplay';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';

export default function SuccessPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <StripeCheckoutDisplay />
    </div>
  );
} 