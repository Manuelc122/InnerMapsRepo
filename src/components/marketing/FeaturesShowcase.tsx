import React from 'react';
import { Sparkles, Brain, Lightbulb, Heart } from 'lucide-react';

export function FeaturesShowcase() {
  return (
    <section className="py-24 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Transform Your Journaling Experience
          </h2>
          <p className="text-xl text-gray-600">
            Discover insights and patterns you never knew existed
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interface Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-gray-800">Today's Reflection</h3>
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
                    <p className="text-gray-600">Start typing your reflection...</p>
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
              </div>
            </div>

            {/* Floating Features */}
            <div className="absolute -right-4 top-4 transform translate-x-full hidden lg:block">
              <div className="space-y-4">
                <Feature
                  icon={Lightbulb}
                  title="Smart Prompts"
                  description="AI-generated prompts that inspire deeper reflection"
                />
                <Feature
                  icon={Brain}
                  title="Pattern Recognition"
                  description="Uncover recurring themes in your journey"
                />
                <Feature
                  icon={Heart}
                  title="Emotional Tracking"
                  description="Monitor your emotional well-being over time"
                />
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-8 lg:pl-12">
            <Benefit
              title="AI-Powered Insights"
              description="Our advanced AI analyzes your entries to uncover patterns, themes, and opportunities for growth that you might miss."
            />
            <Benefit
              title="Guided Reflection"
              description="Smart prompts and questions that adapt to your journey, helping you dig deeper and gain meaningful insights."
            />
            <Benefit
              title="Personal Growth Tracking"
              description="Watch your progress over time with emotional tracking and pattern recognition that celebrates your growth."
            />
            <Benefit
              title="Private & Secure"
              description="Your thoughts are precious. We use bank-level encryption to ensure your journal stays private and secure."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, description }: { 
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 max-w-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function Benefit({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}