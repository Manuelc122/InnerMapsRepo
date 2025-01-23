import React from 'react';
import { HeroSection } from '../Landing/HeroSection';
import { ValueProposition } from '../Landing/ValueProposition';
import { AuthForm } from './AuthForm';

export function LoginScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          <HeroSection />
          <ValueProposition />
          <div className="max-w-md mx-auto">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}