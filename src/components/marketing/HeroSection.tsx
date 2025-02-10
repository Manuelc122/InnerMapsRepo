import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, Brain, Sparkles, Mail, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../shared/Logo';
import { useAuth } from '../../state-management/AuthContext';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signInWithEmail(email, password);
      navigate('/journal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      const pricingTitle = pricingSection.querySelector('.gradient-text');
      if (pricingTitle) {
        pricingTitle.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        // Add offset for the fixed header
        const offset = 100;
        const elementPosition = pricingTitle.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background with more pronounced gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-white pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo />
            <div className="flex items-center gap-4">
              {/* Quick Links */}
              <div className="hidden md:flex items-center gap-6">
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Features
                </a>
                <a 
                  href="#demo" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Demo
                </a>
                <a 
                  href="#pricing" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Pricing
                </a>
                <a 
                  href="#about" 
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  About
                </a>
              </div>
              <button 
                onClick={() => setIsSignInOpen(true)}
                className="text-[#4461F2] hover:text-[#3651E2] font-medium transition-colors duration-200"
              >
                Sign In
              </button>
              <button 
                onClick={scrollToPricing}
                className="btn-secondary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign In Modal */}
      <AnimatePresence>
        {isSignInOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setIsSignInOpen(false)}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md mx-4 p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold gradient-text">Welcome Back</h2>
                  <button
                    onClick={() => setIsSignInOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-500 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white"
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
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-xl hover:opacity-90 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignInOpen(false);
                      scrollToPricing();
                    }}
                    className="w-full text-sm text-gray-600 hover:text-[#4461F2] transition-colors duration-200"
                  >
                    Don't have an account? Sign Up
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="flex-1 flex items-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold mb-6 gradient-text leading-tight"
              >
                Transform Your Inner Dialogue with AI-Guided Journaling
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                Experience a new kind of journaling that responds with personalized insights, helping you uncover deeper understanding and growth.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button 
                  onClick={scrollToPricing}
                  className="btn-primary text-lg px-8 py-4 rounded-xl flex items-center justify-center"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Secure & Private</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column - App Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Daily Reflection</h3>
                    <p className="text-sm text-gray-500">AI-Powered Insights</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600">
                      "I'm noticing a pattern in my decision-making..."
                    </p>
                    <div className="mt-2 flex gap-2">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 bg-gradient-to-t from-[#4461F2] to-[#7E87FF] rounded-full opacity-50"
                          style={{
                            height: `${Math.sin(i * 0.5) * 16 + 16}px`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#4461F2]/5 p-4 rounded-xl">
                    <p className="text-sm font-medium text-[#4461F2]">
                      AI Analysis: High clarity and emotional awareness detected
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}