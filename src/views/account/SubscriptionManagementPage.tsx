import React, { useState, useEffect } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { SubscriptionManager } from '../../components/payment/SubscriptionManager';
import { supabase } from '../../utils/supabaseClient';

export default function SubscriptionManagementPage() {
  const { user } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user's subscription from the database
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // In a real implementation, you would fetch the subscription from your database
        // For now, we'll simulate this with a mock response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock subscription data (in a real app, this would come from your database)
        // This is just for demonstration purposes
        const mockSubscriptionId = `SUBSCRIPTION_${Date.now()}`;
        setSubscriptionId(mockSubscriptionId);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load your subscription details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user]);
  
  // Handle subscription cancellation
  const handleSubscriptionCancelled = () => {
    // In a real implementation, you would update your database
    console.log('Subscription cancelled');
  };

  // Handle back button click
  const handleGoBack = () => {
    window.history.back();
  };
  
  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white">
        <div className="container mx-auto p-8 text-center">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">Manage Your Subscription</h1>
          <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 p-6 rounded-lg max-w-md mx-auto shadow-sm">
            <div className="flex justify-center mb-4 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9" />
              </svg>
            </div>
            <p className="text-gray-700 mb-4">
              Please log in to manage your subscription.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="mt-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-6 rounded-md hover:opacity-90 transition-opacity"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white">
      <div className="container mx-auto p-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <button 
            onClick={handleGoBack}
            className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">Manage Your Subscription</h1>
          <p className="text-gray-600 mb-8">
            View and manage your InnerMaps subscription details.
          </p>
          
          {/* Loading state */}
          {isLoading && (
            <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-lg border border-indigo-100 shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your subscription details...</p>
            </div>
          )}
          
          {/* Error state */}
          {!isLoading && error && (
            <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Subscription manager */}
          {!isLoading && !error && (
            <SubscriptionManager
              subscriptionId={subscriptionId || undefined}
              onCancel={handleSubscriptionCancelled}
            />
          )}
          
          {/* Additional information */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">Subscription FAQ</h2>
            
            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
                <h3 className="font-medium mb-2">How do I update my payment method?</h3>
                <p className="text-gray-600">
                  To update your payment method, please contact our support team at support@innermaps.com.
                  We'll help you update your payment information securely.
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
                <h3 className="font-medium mb-2">What happens when I cancel my subscription?</h3>
                <p className="text-gray-600">
                  When you cancel your subscription, you'll continue to have access to premium features
                  until the end of your current billing period. After that, your account will revert to the free tier.
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 shadow-sm">
                <h3 className="font-medium mb-2">Can I get a refund?</h3>
                <p className="text-gray-600">
                  We don't typically offer refunds for subscription payments. However, if you're experiencing
                  issues with our service, please contact our support team and we'll do our best to help.
                </p>
              </div>
            </div>
          </div>
          
          {/* Contact support */}
          <div className="mt-12 bg-white/90 backdrop-blur-sm p-6 rounded-lg border border-indigo-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">Need Help?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions or need assistance with your subscription,
              our support team is here to help.
            </p>
            <a
              href="mailto:support@innermaps.com"
              className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-6 rounded-md hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 