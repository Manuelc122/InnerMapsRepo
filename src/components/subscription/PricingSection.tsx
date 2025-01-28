import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../state-management/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../authentication/AuthModal';

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/journal');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Outer blur for fading edges */}
        <div className="absolute inset-0 bg-gradient-radial from-white/80 via-white/50 to-transparent rounded-[3rem] blur-3xl"></div>
        
        {/* Inner container for content structure */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Start your journey of self-discovery today with our powerful AI-driven journaling platform
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 max-w-lg mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/50 rounded-[2.5rem] blur-2xl transform scale-105"></div>
              
              <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md">
                    Full Access
                  </span>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">Monthly Plan</h3>
                  <p className="mt-2 text-gray-600">Everything you need for personal growth</p>
                  
                  <div className="mt-8 flex items-baseline justify-center">
                    <span className="text-5xl font-bold tracking-tight text-blue-600">$10</span>
                    <span className="text-xl font-medium text-gray-500 ml-2">/month</span>
                  </div>
                </div>

                <ul className="mt-10 space-y-4">
                  {[
                    { text: 'Unlimited journal entries', highlight: true },
                    { text: 'Advanced AI insights for deeper self-understanding', highlight: true },
                    { text: 'Voice journaling for natural expression', highlight: true },
                    { text: 'AI coaching conversations for personal growth', highlight: true }
                  ].map((feature, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      className="flex items-center"
                    >
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`ml-3 ${feature.highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {feature.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-10"
                >
                  <button 
                    onClick={handleGetStarted}
                    className="w-full rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started Now
                  </button>
                </motion.div>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Start improving your life today with AI-powered journaling
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        plan="monthly"
      />
    </>
  );
}