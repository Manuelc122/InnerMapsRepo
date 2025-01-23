import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { type JournalEntry } from '../types';
import { DiaryEntry } from './DiaryEntry';
import { PatternInsights } from './Analysis/PatternInsights';
import { ErrorAlert } from './ui/ErrorAlert';

interface JournalEntriesProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  error?: Error | null;
}

export function JournalEntries({ entries, onDelete, error }: JournalEntriesProps) {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Your Journey
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showInsights ? 'View Entries' : 'View Insights'}
          </button>
          <div className="text-sm text-gray-500">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Error Loading Entries"
          message={error.message}
          icon={AlertCircle}
        />
      )}
      
      {showInsights ? (
        <PatternInsights entries={entries} />
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
          {entries.length === 0 && !error ? (
            <div className="text-center py-8 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <Star className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-600">Your journey begins with a single thought.</p>
              <p className="text-sm text-gray-500 mt-1">Share your first reflection above.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <DiaryEntry
                key={entry.id}
                entry={entry}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}