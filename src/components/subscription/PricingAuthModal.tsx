import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signIn, signUp } from '../../utils/auth';
import { LegalAgreements } from '../auth/LegalAgreements';

interface PricingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'free' | 'monthly' | 'yearly';
  onSuccess: () => void;
}

const PLAN_DETAILS = {
  free: {
    name: 'Free Plan',
    price: '$0/forever'
  },
  monthly: {
    name: 'Monthly Plan',
    price: '$10/month'
  },
  yearly: {
    name: 'Yearly Plan',
    price: '$100/year'
  }
} as const;

export function PricingAuthModal({ isOpen, onClose, plan, onSuccess }: PricingAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLegalAgreements, setShowLegalAgreements] = useState(false);
  const [legalAgreementsAccepted, setLegalAgreementsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // If signing up and legal agreements not yet accepted, show them first
        if (!legalAgreementsAccepted) {
          setShowLegalAgreements(true);
          setIsSubmitting(false);
          return;
        }
        
        setIsLoading(true);
        const result = await signUp(email, password);
        onSuccess();
      } else {
        setIsLoading(true);
        await signIn(email, password);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleLegalAgreementsComplete = (accepted: boolean) => {
    setLegalAgreementsAccepted(accepted);
    setShowLegalAgreements(false);
    
    if (accepted) {
      // Instead of calling signUp directly, we'll submit the form
      // This prevents duplicate signup attempts
      setTimeout(() => {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }, 100);
    }
  };

  if (!isOpen) return null;

  const planDetails = PLAN_DETAILS[plan];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-indigo-100 shadow-lg">
        {showLegalAgreements ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">
                Legal Agreements
              </h2>
              <button
                onClick={() => setShowLegalAgreements(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LegalAgreements onComplete={handleLegalAgreementsComplete} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              {isSignUp ? 'Start your journey with' : 'Continue with'} {planDetails.name} at {planDetails.price}
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-indigo-100 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-indigo-100 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                  required
                />
              </div>

              {isSignUp && (
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={legalAgreementsAccepted}
                      onChange={(e) => setLegalAgreementsAccepted(e.target.checked)}
                      className="w-4 h-4 border border-indigo-300 rounded bg-indigo-50 focus:ring-3 focus:ring-indigo-300"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-gray-600">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowLegalAgreements(true);
                        }}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        Terms of Service and Privacy Policy
                      </button>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || (isSignUp && !legalAgreementsAccepted)}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-indigo-600 hover:text-indigo-800"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}