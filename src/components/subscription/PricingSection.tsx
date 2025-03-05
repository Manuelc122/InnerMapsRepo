import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';

const features = [
  'Smart journaling with rich text formatting',
  'AI coach chat with personalized guidance and memory integration',
  'Automatic memory extraction and organization from your entries',
  'Semantic search to find relevant memories and insights',
  'Voice-to-text transcription for natural expression'
];

export function PricingSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUpWithEmail, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isSignIn) {
        await signInWithEmail(email, password);
        navigate('/journal');
      } else {
        const result = await signUpWithEmail(email, password, 'monthly');
        // Handle the redirect using React Router
        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isSignIn ? 'sign in' : 'sign up'}`);
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setError(null);
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 gradient-text px-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your personal growth journey with our AI-powered journaling platform
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Full Access Badge */}
            <div className="text-center py-3 bg-gradient-to-r from-[#4461F2] to-[#7E87FF]">
              <span className="inline-block px-6 py-2 text-white text-sm font-medium">
                Full Access
              </span>
            </div>

            {/* Plan Details */}
            <div className="px-8 pt-6 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Monthly Plan
              </h3>
              <p className="text-center text-gray-600 mb-8">
                All the tools you need for self-discovery and personal growth
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold gradient-text">$12</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isAuthModalOpen ? (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsSignIn(false);
                    }}
                    className="group block w-full py-4 px-8 text-center text-white bg-gradient-to-r from-[#4461F2] to-[#7E87FF] rounded-xl hover:opacity-90 transition-all duration-200"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsSignIn(true);
                    }}
                    className="block w-full py-4 px-8 text-center text-[#4461F2] bg-transparent border-2 border-[#4461F2] rounded-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                      {isSignIn ? 'Welcome Back!' : 'Create Your Account'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isSignIn ? 'Sign in to continue your journey' : 'Start your journey today'}
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
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white/50"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isSignIn ? "Enter your password" : "Create a password"}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white/50"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 px-8 text-white bg-gradient-to-r from-[#4461F2] to-[#7E87FF] rounded-xl hover:opacity-90 transition-all duration-200"
                  >
                    {isSignIn ? 'Sign In' : 'Start Journaling'}
                    <ArrowRight className="ml-2 w-5 h-5 inline-block" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="w-full text-sm text-gray-600 hover:text-[#4461F2] transition-colors duration-200"
                  >
                    {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </form>
              )}

              {/* Footer Text */}
              <p className="text-center text-gray-500 text-sm mt-6">
                Discover meaningful patterns in your thoughts and experiences with InnerMaps
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}