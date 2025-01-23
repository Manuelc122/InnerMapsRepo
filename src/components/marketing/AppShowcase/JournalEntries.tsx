import React from 'react';
import { Calendar, Heart } from 'lucide-react';

export function JournalEntries() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800">Your Journey</h4>
            <button className="text-sm text-blue-600">View All</button>
          </div>

          <div className="space-y-4">
            <JournalEntry
              date="Today"
              content="Started implementing the new project management system at work. Despite initial challenges, the team's positive attitude made a huge difference."
              tags={['Work', 'Growth', 'Leadership']}
            />
            <JournalEntry
              date="Yesterday"
              content="Had a great conversation with Sarah about our future plans. It's amazing how aligned we are on our goals."
              tags={['Relationships', 'Future', 'Connection']}
            />
            <JournalEntry
              date="2 days ago"
              content="Morning meditation was particularly peaceful today. Feeling centered and ready for whatever comes my way."
              tags={['Mindfulness', 'Peace', 'Morning Routine']}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Your Story, Your Way</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Capture your journey with rich, meaningful entries that help you track your growth and celebrate your progress.
        </p>
        <ul className="space-y-4">
          <Feature
            title="Rich Text Formatting"
            description="Express yourself with formatting options that make your entries unique"
          />
          <Feature
            title="Emotional Tagging"
            description="Tag entries with emotions and themes for better self-understanding"
          />
          <Feature
            title="Search & Filter"
            description="Easily find past entries and track your journey over time"
          />
        </ul>
      </div>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-500" />
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}

function JournalEntry({ date, content, tags }: { date: string; content: string; tags: string[] }) {
  return (
    <div className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Calendar className="w-4 h-4" />
        <span>{date}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{content}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
          >
            <Heart className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}