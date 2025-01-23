import React from 'react';
import { Brain, Sparkles, Heart } from 'lucide-react';
import { Feature } from './Feature';
import { useLanguage } from '../../../contexts/LanguageContext';

export function JournalingInterface() {
  const { t } = useLanguage();
  
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {t('showcase.journal.title')}
        </h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          {t('showcase.journal.subtitle')}
        </p>
        <ul className="space-y-4">
          <Feature 
            icon={Sparkles}
            title={t('showcase.journal.feature1.title')} 
            description={t('showcase.journal.feature1.description')}
          />
          <Feature 
            icon={Brain}
            title={t('showcase.journal.feature2.title')} 
            description={t('showcase.journal.feature2.description')}
          />
          <Feature 
            icon={Heart}
            title={t('showcase.journal.feature3.title')} 
            description={t('showcase.journal.feature3.description')}
          />
        </ul>
      </div>

      {/* Interactive Demo */}
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">Today's Reflection</h4>
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Insights</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What's one small win you're grateful for today?
            </label>
            <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-400">Start typing your reflection...</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Brain className="w-5 h-5" />
              <h4 className="font-medium">AI Insight Preview</h4>
            </div>
            <p className="text-gray-600 text-sm">
              I notice you often find joy in helping others. This seems to be a core value...
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Entry
            </button>
            <button className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              Get More Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}