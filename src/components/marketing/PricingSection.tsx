import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const features = [
  'Unlimited journal entries',
  'Advanced AI insights for deeper self-understanding',
  'Voice journaling for natural expression',
  'AI coaching conversations for personal growth'
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start your journey of self-discovery today with our powerful AI-driven journaling platform
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Full Access Badge */}
            <div className="text-center py-3">
              <span className="inline-block px-6 py-2 bg-[#4461F2] text-white rounded-full text-sm font-medium">
                Full Access
              </span>
            </div>

            {/* Plan Details */}
            <div className="px-8 pt-6 pb-12">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Monthly Plan
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Everything you need for personal growth
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold text-[#4461F2]">$10</span>
                  <span className="text-gray-500 ml-2">/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#4461F2]" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                to="/auth/signup"
                className="block w-full py-4 px-8 text-center text-white bg-[#4461F2] rounded-xl hover:bg-[#3651E2] transition-colors duration-200"
              >
                Get Started Now
              </Link>

              {/* Footer Text */}
              <p className="text-center text-gray-500 text-sm mt-6">
                Start improving your life today with AI-powered journaling
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 