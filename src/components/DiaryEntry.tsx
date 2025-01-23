import React, { useState } from 'react';
import { Calendar, Trash2, Heart } from 'lucide-react';
import { type JournalEntry } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface DiaryEntryProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export function DiaryEntry({ entry, onDelete }: DiaryEntryProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <div
        className="group relative p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md animate-fade-in"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <time>{formatDate(new Date(entry.timestamp))}</time>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className={`p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className={`${entry.font || 'font-belle-aurore'} text-gray-700 whitespace-pre-wrap leading-relaxed`}>
          {entry.content}
        </div>
        {entry.sentiment?.tags && entry.sentiment.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.sentiment.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-full text-xs font-medium"
              >
                <Heart className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => onDelete(entry.id)}
        title="Delete This Memory?"
        message="This entry will be permanently removed from your journal. Are you sure you want to continue?"
      />
    </>
  );
}