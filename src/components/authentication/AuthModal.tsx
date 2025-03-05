import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LegalAgreements } from '../auth/LegalAgreements';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: 'free' | 'monthly' | 'yearly';
}

export function AuthModal({ isOpen, onClose, plan = 'free' }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, error: authError } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegalAgreements, setShowLegalAgreements] = useState(false);
  const [legalAgreementsAccepted, setLegalAgreementsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      setLoading(true);
      setError(null);
      if (isSignIn) {
        await signInWithEmail(email, password, plan === 'free' ? undefined : plan);
        onClose();
      } else {
        // If signing up and legal agreements not yet accepted, show them first
        if (!legalAgreementsAccepted) {
          setShowLegalAgreements(true);
          setLoading(false);
          setIsSubmitting(false);
          return;
        }
        
        const result = await signUpWithEmail(email, password, plan === 'free' ? undefined : plan);
        onClose();
        
        // If there's a redirect URL, navigate to it
        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleLegalAgreementsComplete = (accepted: boolean) => {
    setLegalAgreementsAccepted(accepted);
    setShowLegalAgreements(false);
    
    if (accepted) {
      // Instead of calling signUpWithEmail directly, we'll submit the form
      // This prevents duplicate signup attempts
      setTimeout(() => {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
        }
      }, 100);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mx-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {showLegalAgreements ? (
              <div className="py-2">
                <h3 className="text-xl font-bold text-center mb-4 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text">
                  Legal Agreements
                </h3>
                <LegalAgreements onComplete={handleLegalAgreementsComplete} />
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] text-transparent bg-clip-text mb-2">
                    {plan === 'free' ? 'Get Started for Free' : 'Start Your Journey'}
                  </h2>
                  <p className="text-gray-600">
                    {plan === 'free' 
                      ? 'Begin your journey of self-discovery'
                      : `Start your ${plan} plan and unlock all features`}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:border-indigo-300 focus:ring-indigo-200"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-indigo-100 rounded-xl focus:border-indigo-300 focus:ring-indigo-200"
                      required
                    />
                    
                    {!isSignIn && (
                      <div className="flex items-start mt-4">
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
                      disabled={loading || (!isSignIn && !legalAgreementsAccepted)}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-[#6C63FF] to-[#9D4EDD] rounded-xl font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Mail className="w-5 h-5" />
                      {isSignIn ? 'Sign In with Email' : 'Sign Up with Email'}
                    </button>
                  </form>

                  <button
                    onClick={() => setIsSignIn(!isSignIn)}
                    className="w-full text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>

                {isSignIn && (
                  <p className="mt-6 text-center text-sm text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 