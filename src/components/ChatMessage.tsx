import React from 'react';
import { MessageSquare, Lightbulb } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 items-start group animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-100' 
          : 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-100'
      } shadow-lg`}>
        {isUser ? (
          <MessageSquare className="w-4 h-4 text-white" />
        ) : (
          <Lightbulb className="w-4 h-4 text-white" />
        )}
      </div>
      <div 
        className={`relative max-w-[80%] group-hover:shadow-lg transition-all duration-300 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm'
        }`}
      >
        <div className="p-4">
          <div className="text-xs opacity-75 mb-1">
            {isUser ? 'You' : 'Journal Guide'}
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>
        <div className={`absolute ${isUser ? '-left-2' : '-right-2'} top-3 w-2 h-2 transform rotate-45 ${
          isUser ? 'bg-blue-500' : 'bg-white border-l border-t border-gray-200'
        }`} />
      </div>
    </div>
  );
}