import React, { useState } from 'react';
import { SubscriptionForm } from '../../components/payment/SubscriptionForm';
import { useAuth } from '../../state-management/AuthContext';
import { Logo } from '../../components/shared/Logo';
import { Link } from 'react-router-dom';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle successful subscription creation
  const handleSubscriptionSuccess = (id: string) => {
    console.log('Subscription created successfully:', id);
    setSubscriptionId(id);
    
    // In a real application, you would store the subscription ID in your database
    // and associate it with the user's account
  };
  
  // Handle subscription creation error
  const handleSubscriptionError = (error: Error) => {
    console.error('Error creating subscription:', error);
    setError(error.message);
  };
  
  // Handle navigation to home page
  const handleBackToHome = () => {
    // Navigate to the landing page route that doesn't redirect
    window.location.href = '/landing';
  };
  
  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-[#6C63FF]/10 to-[#9D4EDD]/10 blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-blue-300/10 to-indigo-300/10 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-200/10 to-purple-200/10 blur-3xl"></div>
        </div>
        
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToHome}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mr-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </button>
                <Logo />
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Log in</Link>
                <Link to="/signup" className="text-sm font-medium bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white px-4 py-2 rounded-md hover:opacity-90">Sign up</Link>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto p-8 text-center mt-16 relative z-1">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-50/80 rounded-full text-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Authentication Required</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Subscribe to InnerMaps</h1>
            
            <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 p-8 rounded-2xl max-w-md mx-auto shadow-md">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <p className="text-gray-700 mb-6">
                Please log in to your account to subscribe to InnerMaps and access all premium features.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white py-2 px-6 rounded-md hover:opacity-90 shadow-sm"
                >
                  Log In
                </button>
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="border border-indigo-200 text-gray-700 py-2 px-6 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-[#6C63FF]/10 to-[#9D4EDD]/10 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-gradient-to-r from-blue-300/10 to-indigo-300/10 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-indigo-200/10 to-purple-200/10 blur-3xl"></div>
      </div>
      
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToHome}
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              <Logo />
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">Dashboard</Link>
              <button 
                onClick={() => window.location.href = '/account/subscription'} 
                className="text-sm font-medium bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white px-4 py-2 rounded-md hover:opacity-90"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-8 mt-8 relative z-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">Subscribe to InnerMaps</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get unlimited access to all InnerMaps features with a monthly subscription.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Subscription benefits */}
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-md border border-indigo-100 transform transition-all hover:shadow-lg">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Monthly Subscription Benefits</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] flex items-center justify-center text-white mr-3 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Unlimited AI-assisted journaling sessions</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] flex items-center justify-center text-white mr-3 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Advanced insights and pattern recognition</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] flex items-center justify-center text-white mr-3 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Personalized growth recommendations</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] flex items-center justify-center text-white mr-3 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Secure cloud storage and synchronization</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] flex items-center justify-center text-white mr-3 mt-0.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Priority customer support</span>
                </li>
              </ul>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 rounded-xl border border-indigo-100/50">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">$12</span>
                  <span className="text-gray-700 ml-2">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Cancel anytime. No long-term commitment.
                </p>
              </div>
            </div>
            
            {/* Subscription form */}
            <div>
              <SubscriptionForm
                planAmount={12}
                planInterval="MONTH"
                planDescription="InnerMaps Monthly Subscription"
                onSuccess={handleSubscriptionSuccess}
                onError={handleSubscriptionError}
              />
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-20 mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-50/80 rounded-full text-indigo-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Support</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about your InnerMaps subscription
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How does billing work?
                </h3>
                <p className="text-gray-600">
                  Your subscription will be billed monthly on the same date you initially subscribed. 
                  For example, if you subscribe on the 15th, you'll be billed on the 15th of each month.
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Can I cancel my subscription?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time from your account settings. 
                  Your subscription will remain active until the end of the current billing period.
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Is my payment information secure?
                </h3>
                <p className="text-gray-600">
                  Yes, we use PayU, a secure payment processor, to handle all payments. 
                  Your credit card information is never stored on our servers and all transactions are securely processed by PayU.
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What happens if I have issues with my subscription?
                </h3>
                <p className="text-gray-600">
                  Our customer support team is available to help with any subscription issues. 
                  Please contact us at support@innermaps.com for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200 mt-16 relative z-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
              <p className="text-sm text-gray-500 mt-2">
                AI-assisted journaling for personal growth
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="/contact" className="text-sm text-gray-500 hover:text-gray-900">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} InnerMaps. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 