import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function CallToAction() {
  const { t } = useLanguage();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Start Your Self-Discovery Journey Today
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Join thousands of others who are deepening their self-awareness through AI-guided journaling
        </p>
        <button
          onClick={scrollToPricing}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-medium text-lg group"
        >
          Create Your Journal
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}