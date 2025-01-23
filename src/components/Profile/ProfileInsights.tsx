import React from 'react';
import { Brain, Sparkles, Target, Compass } from 'lucide-react';
import { RecommendedTopics } from './RecommendedTopics';
import { type ProfileAnalysis } from '../../types/profile';

interface ProfileInsightsProps {
  analysis: ProfileAnalysis | null;
  isLoading: boolean;
  userName: string;
}

export function ProfileInsights({ analysis, isLoading, userName }: ProfileInsightsProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-blue-100 rounded w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-50 rounded"></div>
          <div className="h-4 bg-blue-50 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-blue-200 mx-auto mb-4" />
        <p className="text-gray-500">Start journaling to see your insights, {userName}!</p>
      </div>
    );
  }

  const insights = [
    {
      icon: Brain,
      title: "Emotional Patterns",
      content: analysis.emotionalPatterns,
    },
    {
      icon: Target,
      title: "Growth Areas",
      content: analysis.growthAreas,
    },
    {
      icon: Compass,
      title: "Current Focus",
      content: analysis.currentFocus,
    },
    {
      icon: Sparkles,
      title: "Strengths",
      content: analysis.strengths,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md"
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

      <RecommendedTopics topics={analysis.suggestedTopics} />
    </div>
  );
}