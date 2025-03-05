import React, { useState } from 'react';
import { useAuth } from '../../state-management/AuthContext';
import { Logo } from '../../components/shared/Logo';
import { Link } from 'react-router-dom';
import { PayUCheckoutButton } from '../../components/subscription/PayUCheckoutButton';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle successful subscription creation
  const handleSubscriptionSuccess = (ref: string) => {
    console.log('Subscription payment initiated successfully:', ref);
    setReference(ref);
    
    // In a real application, you would store the reference in your database
    // and associate it with the user's account
  };
  
  // Handle subscription creation error
  const handleSubscriptionError = (error: Error) => {
    console.error('Error creating subscription:', error);
    setError(error.message);
  };
  
  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Logo />
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Log in</Link>
                <Link to="/signup" className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-indigo-700">Sign up</Link>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto p-8 text-center mt-16">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Subscribe to InnerMaps</h1>
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg max-w-md mx-auto shadow-md">
            <p className="text-yellow-800 mb-4">
              Please log in to subscribe to InnerMaps.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6 rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">Dashboard</Link>
              <button 
                onClick={() => window.location.href = '/account/subscription'} 
                className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-indigo-700"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-8 mt-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Subscribe to InnerMaps</h1>
          <p className="text-gray-600 mb-8 text-center">
            Get unlimited access to all InnerMaps features with a monthly subscription.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Subscription benefits */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Monthly Subscription Benefits</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited AI-assisted journaling sessions</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced insights and pattern recognition</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized growth recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure cloud storage and synchronization</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority customer support</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">$12</span>
                  <span className="text-gray-700 ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cancel anytime. No long-term commitment.
                </p>
              </div>
            </div>
            
            {/* Subscription form */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Subscribe with PayU</h2>
              <p className="text-gray-600 mb-6">
                Click the button below to subscribe to InnerMaps using PayU's secure payment system.
              </p>
              
              <PayUCheckoutButton
                planId="monthly"
                amount={12}
                buttonText="Subscribe Now"
                onSuccess={handleSubscriptionSuccess}
                onError={handleSubscriptionError}
              />
              
              {reference && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                  <p className="text-green-800 text-sm">
                    Payment initiated! Reference: {reference}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    You will be redirected to PayU to complete your payment.
                  </p>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-red-800 text-sm">
                    Error: {error}
                  </p>
                </div>
              )}
              
              <div className="mt-6 text-xs text-gray-500">
                <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
                <p className="mt-1">Your payment will be processed securely by PayU.</p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">How does billing work?</h3>
                <p className="text-gray-600">
                  Your subscription will be billed monthly on the same date you initially subscribed. 
                  For example, if you subscribe on the 15th, you'll be billed on the 15th of each month.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Can I cancel my subscription?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time from your account settings. 
                  Your subscription will remain active until the end of the current billing period.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Is my payment information secure?</h3>
                <p className="text-gray-600">
                  Yes, we use PayU, a secure payment processor, to handle all payments. 
                  Your credit card information is never stored on our servers and all transactions are securely processed by PayU.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">What happens if I have issues with my subscription?</h3>
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
      <footer className="bg-white border-t border-gray-200 mt-16">
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