import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../state-management/AuthContext';
import SubscriptionPlanSelector from '../../components/subscription/SubscriptionPlanSelector';

/**
 * This component handles the subscription flow after registration.
 * It shows the subscription plan options for users to choose from.
 */
export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If no user, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <SubscriptionPlanSelector />
    </div>
  );
} 