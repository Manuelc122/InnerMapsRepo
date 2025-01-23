import React from 'react';
import { ArrowRight } from 'lucide-react';

const transformations = [
  {
    before: "Scattered thoughts",
    after: "Clear patterns"
  },
  {
    before: "Silent diary",
    after: "Interactive guidance"
  },
  {
    before: "Missed patterns",
    after: "Real-time insights"
  },
  {
    before: "Solo journey",
    after: "AI-powered companionship"
  }
];

export function TransformationGrid() {
  return (
    <div className="py-12">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
        From Uncertainty to Clarity
      </h3>
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {transformations.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="text-gray-500 line-through">
              {item.before}
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <div className="text-blue-600 font-medium">
              {item.after}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}