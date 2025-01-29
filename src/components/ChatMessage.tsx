import React from 'react';
import { MessageSquare, Lightbulb } from 'lucide-react';

interface TextBlock {
  type: 'header' | 'paragraph' | 'list-item' | 'emphasis';
  content: string;
  level?: number;
  format?: {
    bold?: boolean;
    italic?: boolean;
    bullet?: boolean;
  };
}

interface ChatMessageProps {
  message: string;
  blocks?: TextBlock[];
  isUser: boolean;
  timestamp?: string;
}

export function ChatMessage({ message, blocks, isUser, timestamp }: ChatMessageProps) {
  const renderBlock = (block: TextBlock, index: number) => {
    const baseStyles = "text-sm leading-relaxed";
    
    switch (block.type) {
      case 'header':
        const headerSize = block.level && block.level <= 3 
          ? 'text-lg font-bold'
          : 'text-base font-semibold';
        return (
          <div key={index} className={`${headerSize} mb-3 text-inherit`}>
            {block.content}
          </div>
        );

      case 'paragraph':
        return (
          <p key={index} className={`${baseStyles} mb-3`}>
            {block.content}
          </p>
        );

      case 'list-item':
        return (
          <div key={index} className={`${baseStyles} mb-2 flex items-start`}>
            <span className="mr-2 select-none">•</span>
            <span>{block.content}</span>
          </div>
        );

      case 'emphasis':
        return (
          <div key={index} className={`${baseStyles} mb-3 font-medium`}>
            {block.content}
          </div>
        );

      default:
        return (
          <p key={index} className={`${baseStyles} mb-3`}>
            {block.content}
          </p>
        );
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-blue-500 text-white ml-auto rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        <div className="space-y-1">
          {blocks ? (
            blocks.map((block, index) => renderBlock(block, index))
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          )}
        </div>
        {timestamp && (
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {timestamp}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}