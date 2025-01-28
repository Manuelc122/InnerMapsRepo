import React from 'react';
import { Logo } from '../shared/Logo';

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                const featuresSection = document.getElementById('features');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className="text-gray-600 hover:text-gray-900"
            >
              Features
            </a>
            <a href="#demo" className="text-gray-600 hover:text-gray-900">Demo</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            <button 
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 