import React, { useState, useEffect } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { payuService } from '../../utils/payu';

interface SubscriptionManagerProps {
  subscriptionId?: string;
  onCancel?: () => void;
}

interface Subscription {
  id: string;
  status: string;
  plan: {
    description: string;
    interval?: string;
    planCode?: string;
    additionalValues?: Array<{
      name: string;
      value: string;
      currency: string;
    }>;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export function SubscriptionManager({ subscriptionId, onCancel }: SubscriptionManagerProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Fetch subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) {
        // If no subscription ID is provided, create a mock subscription for testing
        const mockSubscription: Subscription = {
          id: `SUBSCRIPTION_${Date.now()}`,
          status: 'ACTIVE',
          plan: {
            description: 'InnerMaps Monthly Subscription',
            interval: 'MONTH',
            planCode: 'MONTHLY_PLAN',
            additionalValues: [
              {
                name: 'PLAN_VALUE',
                value: '12.00',
                currency: 'USD'
              }
            ]
          },
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setSubscription(mockSubscription);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch subscription details from PayU
        const subscriptionData = await payuService.getSubscription(subscriptionId);
        
        // Transform the data to match our expected format if needed
        const formattedSubscription: Subscription = {
          id: subscriptionData.id,
          status: subscriptionData.status,
          plan: {
            description: subscriptionData.plan.description || 'InnerMaps Subscription',
            interval: subscriptionData.plan.interval || 'MONTH',
            planCode: subscriptionData.plan.planCode,
            additionalValues: [
              {
                name: 'PLAN_VALUE',
                value: '12.00',
                currency: 'USD'
              }
            ]
          },
          currentPeriodStart: subscriptionData.currentPeriodStart,
          currentPeriodEnd: subscriptionData.currentPeriodEnd
        };
        
        setSubscription(formattedSubscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [subscriptionId]);
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    
    try {
      setIsCancelling(true);
      setError(null);
      
      // Cancel subscription in PayU
      const result = await payuService.cancelSubscription(subscription.id);
      
      // Update local state
      setSubscription(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      setShowConfirmation(false);
      
      // Call onCancel callback if provided
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setError('Failed to cancel subscription. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Navigate to dashboard
  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get subscription amount
  const getSubscriptionAmount = () => {
    if (!subscription) return '';
    
    const planValue = subscription.plan.additionalValues?.find(v => v.name === 'PLAN_VALUE');
    if (!planValue) return '12.00 USD'; // Default value if not found
    
    return `${planValue.value} ${planValue.currency}`;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading subscription details...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // No subscription found
  if (!subscription) {
    return (
      <div className="p-4 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-lg shadow-sm">
        <p className="text-gray-600">No active subscription found.</p>
        <a
          href="/subscription"
          className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
        >
          Subscribe Now
        </a>
      </div>
    );
  }
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
      <div className="p-4 border-b border-indigo-100 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white">
        <h3 className="text-lg font-semibold">Subscription Details</h3>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="font-medium">{subscription.plan.description}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${
              subscription.status === 'ACTIVE' ? 'text-green-600' : 
              subscription.status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {subscription.status}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">${getSubscriptionAmount()}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Billing Cycle</p>
            <p className="font-medium">
              {subscription.plan.interval === 'MONTH' ? 'Monthly' : 'Yearly'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Current Period Start</p>
            <p className="font-medium">{formatDate(subscription.currentPeriodStart)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Current Period End</p>
            <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
          </div>
        </div>
        
        {/* Subscription actions */}
        {subscription.status === 'ACTIVE' && (
          <div className="mt-6 pt-4 border-t border-indigo-100">
            {!showConfirmation ? (
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              >
                Cancel Subscription
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded">
                <p className="text-red-600 mb-4">
                  Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    No, Keep Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Cancelled subscription message */}
        {subscription.status === 'CANCELLED' && (
          <div className="mt-6 pt-4 border-t border-indigo-100">
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-yellow-700">
                Your subscription has been cancelled. You will have access to premium features until {formatDate(subscription.currentPeriodEnd)}.
              </p>
              <a
                href="/subscription"
                className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-800"
              >
                Resubscribe
              </a>
            </div>
          </div>
        )}

        {/* Dashboard button */}
        <div className="mt-6 pt-4 border-t border-indigo-100 flex justify-center">
          <button
            onClick={handleGoToDashboard}
            className="px-6 py-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white rounded-md hover:opacity-90 transition-opacity flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 