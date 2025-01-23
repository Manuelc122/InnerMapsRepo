import React from 'react';
import { Clock, Sparkles, Shield, Brain } from 'lucide-react';
import { PricingSection } from '../Pricing/PricingSection';

const features = [
  {
    icon: Clock,
    title: "Rapid Results",
    description: "5 minutes daily for breakthrough insights backed by behavioral science"
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Enterprise-grade encryption trusted by industry leaders"
  },
  {
    icon: Brain,
    title: "Proprietary AI Analysis",
    description: "Advanced pattern recognition algorithms reveal hidden opportunities"
  },
  {
    icon: Sparkles,
    title: "Expert-Level Guidance",
    description: "AI coaching refined by leading psychologists"
  }
];

export function ValueProposition() {
  return (
    <>
      <div className="py-12">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Transform Your Life Through Scientific Self-Discovery
          </h3>
          <p className="text-gray-600">
            Leverage cutting-edge AI to unlock your hidden potential
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <PricingSection />
    </>
  );
}