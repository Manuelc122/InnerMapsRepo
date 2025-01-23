import React from 'react';
import { Brain, Sparkles, Target, Compass } from 'lucide-react';
import { type JournalEntry } from '../../types';
import { usePatternAnalysis } from '../../hooks/usePatternAnalysis';
import { ErrorAlert } from '../ui/ErrorAlert';

interface PatternInsightsProps {
  entries: JournalEntry[];
}

export function PatternInsights({ entries }: PatternInsightsProps) {
  const { patterns, isLoading, error, retryAnalysis } = usePatternAnalysis(entries);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-6 h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorAlert 
        title="Analysis Error" 
        message={error.message}
        action={{
          label: "Retry Analysis",
          onClick: retryAnalysis
        }}
      />
    );
  }

  if (!patterns) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-blue-200 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Start Your Journey
        </h3>
        <p className="text-gray-500">
          Begin journaling to discover patterns and insights in your thoughts.
        </p>
      </div>
    );
  }

  const insights = [
    {
      icon: Brain,
      title: "Thought Patterns",
      content: patterns.thoughtPatterns,
    },
    {
      icon: Target,
      title: "Growth Areas",
      content: patterns.growthAreas,
    },
    {
      icon: Compass,
      title: "Core Values",
      content: patterns.coreValues,
    },
    {
      icon: Sparkles,
      title: "Strengths",
      content: patterns.strengths,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Your Patterns & Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <insight.icon className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-medium text-gray-900">{insight.title}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}