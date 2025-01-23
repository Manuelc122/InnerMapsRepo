import React from 'react';
import { JournalingInterface } from './JournalingInterface';
import { AIChat } from './AIChat';
import { InsightsAnalysis } from './InsightsAnalysis';
import { JournalEntries } from './JournalEntries';
import { JournalAnalytics } from './JournalAnalytics';
import { useLanguage } from '../../../contexts/LanguageContext';

export function AppShowcase() {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('showcase.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('showcase.subtitle')}
          </p>
        </div>

        <div className="space-y-32">
          {/* Interactive Journal Demo */}
          <JournalingInterface />

          {/* Journal Analytics Dashboard */}
          <JournalAnalytics />

          {/* AI Chat Experience */}
          <AIChat />

          {/* Personal Growth Analytics */}
          <InsightsAnalysis />

          {/* Journey Timeline */}
          <JournalEntries />

          {/* Trust Indicators */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-blue-50 rounded-full">
              <p className="text-blue-600 font-medium">
                {t('showcase.trust')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}