import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';
import { STRIPE_PLANS, redirectToPaymentLink } from '../../utils/stripeClient';

export function PricingSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail, signInWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isSignIn) {
        // Sign in with the selected plan - the function will handle redirection
        await signInWithEmail(email, password, selectedPlan);
        // No need to manually redirect, the signInWithEmail function will do it
      } else {
        // Sign up with the selected plan - the function will handle redirection
        const result = await signUpWithEmail(email, password, selectedPlan);
        
        // If signup requires email confirmation, show a message
        if (result.success && result.message) {
          setError(result.message); // This isn't really an error, but we'll use the error state to display the message
          setLoading(false);
        }
        // No need to manually redirect, the signUpWithEmail function will do it
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isSignIn ? 'sign in' : 'sign up'}`);
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setError(null);
  };

  const handleSubscribeClick = async (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    
    // If user is already logged in, redirect directly to payment link
    if (user) {
      try {
        setLoading(true);
        redirectToPaymentLink(plan, user.id, user.email);
      } catch (error) {
        console.error('Error redirecting to payment link:', error);
        setError('Failed to redirect to payment page. Please try again.');
        setLoading(false);
      }
    } else {
      // Otherwise, show the auth modal
      setIsAuthModalOpen(true);
      setIsSignIn(false); // Default to sign up for new users
    }
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#6C63FF]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8A6AFD]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] px-16 mx-auto whitespace-nowrap">
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your personal growth journey with our AI-powered journaling platform
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative transition-all duration-300 hover:shadow-2xl">
            {/* Monthly Plan Top Bar */}
            <div className="text-center py-3 bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD]">
              <span className="inline-block px-6 py-2 text-white text-sm font-medium">
                Flexible Monthly Billing
              </span>
            </div>
            
            <div className="px-8 pt-8 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {STRIPE_PLANS.monthly.name}
              </h3>
              <p className="text-center text-gray-600 mb-8">
                All the tools you need for self-discovery
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD]">${STRIPE_PLANS.monthly.price}</span>
                  <span className="text-gray-500 ml-2">/{STRIPE_PLANS.monthly.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {STRIPE_PLANS.monthly.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isAuthModalOpen ? (
                <button
                  onClick={() => handleSubscribeClick('monthly')}
                  disabled={loading}
                  className="group block w-full py-4 px-8 text-center text-white bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Subscribe Monthly
                      <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-[#6C63FF]/20 relative transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-subtle-pulse">
            {/* Best Value Badge */}
            <div className="text-center py-3 bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD]">
              <span className="inline-block px-6 py-2 text-white text-sm font-medium">
                Best Value - 2 Months Free!
              </span>
            </div>

            <div className="px-8 pt-6 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                {STRIPE_PLANS.yearly.name}
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Pay for 10 months, get 12 months access
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD]">${STRIPE_PLANS.yearly.price}</span>
                  <span className="text-gray-500 ml-2">/{STRIPE_PLANS.yearly.period}</span>
                </div>
                <div className="text-sm text-[#6C63FF] font-medium mt-2">
                  That's just $10/month - 2 months free!
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {STRIPE_PLANS.yearly.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isAuthModalOpen ? (
                <button
                  onClick={() => handleSubscribeClick('yearly')}
                  disabled={loading}
                  className="group block w-full py-4 px-8 text-center text-white bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      Subscribe Yearly
                      <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {isAuthModalOpen && (
          <div className="max-w-md mx-auto mt-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  {isSignIn ? 'Welcome Back!' : 'Create Your Account'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isSignIn ? 'Sign in to continue your journey' : 'Sign up to continue to payment'}
                </p>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] bg-white/50"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] bg-white/50"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD] text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isSignIn ? 'Sign In' : 'Sign Up'
                )}
              </button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-[#6C63FF] hover:text-[#8A6AFD] text-sm"
                >
                  {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-12">
          Discover meaningful patterns in your thoughts and experiences with InnerMaps
        </p>
      </div>
    </section>
  );
}