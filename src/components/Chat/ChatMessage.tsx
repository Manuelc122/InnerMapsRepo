import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500' 
          : 'bg-indigo-500'
      }`}>
        {isUser ? (
          <MessageSquare className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      <div 
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}