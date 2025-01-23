import React from 'react';
import { MessageSquare, ArrowRight, Lightbulb } from 'lucide-react';
import type { ProfileAnalysis } from '../../types/profile';

interface RecommendedTopicsProps {
  topics: ProfileAnalysis['suggestedTopics'];
}

export function RecommendedTopics({ topics }: RecommendedTopicsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Topics for Deeper Exploration
          </h3>
        </div>
        <p className="text-sm text-blue-600">Based on your journey</p>
      </div>
      
      <div className="grid gap-4">
        {topics.map((topic, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg p-5 hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-100"
          >
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600 flex items-center gap-2 group">
                {topic.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {topic.description}
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Why explore this: </span>
                    {topic.importance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}