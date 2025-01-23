import React from 'react';
import { Book, Brain } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: typeof Book;
}

interface TabViewProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'journal', label: 'Journal', icon: Book },
  { id: 'insights', label: 'Insights', icon: Brain }
];

export function TabView({ activeTab, onTabChange, children }: TabViewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}