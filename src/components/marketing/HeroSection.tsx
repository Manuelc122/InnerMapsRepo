import React, { useEffect, useState } from 'react';
import { ArrowRight, Shield, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { Logo } from '../ui/Logo';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <>
      <Navigation />
      <motion.section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={containerVariants}
      >
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Logo />
          </motion.div>

          {/* Main Heading */}
          <motion.h2 
            className="text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            The AI Journal That Reads Between Your Lines
          </motion.h2>

          {/* Subheading with Gradient */}
          <motion.p 
            className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            Your personal patterns, revealed
          </motion.p>

          {/* Value Proposition */}
          <motion.p 
            className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            5 minutes of daily journaling → Lifetime of personal insights
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <button 
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Begin Your Growth Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            {[
              { icon: Shield, text: "Bank-grade security" },
              { icon: Brain, text: "AI-powered insights" },
              { icon: Sparkles, text: "10,000+ users" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}