import React from 'react';
import { Brain, TrendingUp, Heart, Target } from 'lucide-react';

export function InsightsAnalysis() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Deep Personal Insights</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Our AI analyzes your journal entries to uncover patterns, track emotional trends, and provide actionable insights for personal growth.
        </p>
        <ul className="space-y-4">
          <Feature
            icon={Brain}
            title="Pattern Recognition"
            description="Identify recurring themes and behaviors in your life"
          />
          <Feature
            icon={TrendingUp}
            title="Growth Tracking"
            description="Monitor your progress and celebrate small wins"
          />
          <Feature
            icon={Target}
            title="Actionable Insights"
            description="Get personalized suggestions for continued growth"
          />
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">Monthly Insights</h4>
            <div className="text-sm text-blue-600">Last 30 Days</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InsightCard
              icon={Heart}
              title="Top Emotions"
              content="Joy, Gratitude, Anticipation"
            />
            <InsightCard
              icon={Target}
              title="Focus Areas"
              content="Career Growth, Relationships"
            />
            <InsightCard
              icon={Brain}
              title="Key Patterns"
              content="Morning reflection boosts mood"
            />
            <InsightCard
              icon={TrendingUp}
              title="Progress"
              content="More positive entries (+15%)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: {
  icon: typeof Brain;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}

function InsightCard({ icon: Icon, title, content }: {
  icon: typeof Brain;
  title: string;
  content: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <h5 className="font-medium text-gray-700 text-sm">{title}</h5>
      </div>
      <p className="text-gray-600 text-sm">{content}</p>
    </div>
  );
}