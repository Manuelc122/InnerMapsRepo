import React from 'react';
import { Compass, MessageSquare, ArrowRight } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { ErrorAlert } from '../ui/ErrorAlert';

export function TopicsSection() {
  const { analysis, isLoading, error } = useProfile();
  const topics = analysis?.suggestedTopics || [];

  if (error) {
    return <ErrorAlert title="Error Loading Topics" message={error.message} />;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <Compass className="w-12 h-12 text-blue-200 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Topics Yet</h3>
        <p className="text-gray-500">
          Continue journaling and chatting to receive personalized topic suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Recommended Topics
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore these topics to deepen your self-discovery journey
        </p>
      </div>

      <div className="grid gap-6">
        {topics.map((topic, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-blue-600 flex items-center gap-2 group">
                {topic.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {topic.description}
              </p>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900">
                      Why This Matters
                    </p>
                    <p className="text-gray-600">
                      {topic.importance}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}