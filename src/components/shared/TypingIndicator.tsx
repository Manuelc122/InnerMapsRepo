import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl w-20 shadow-sm">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-sm" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-sm" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-sm" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}