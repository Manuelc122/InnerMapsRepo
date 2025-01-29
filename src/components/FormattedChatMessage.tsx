import React from 'react';
import { MessageSquare, Lightbulb } from 'lucide-react';

interface FormattedMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

interface ProcessedBlock {
  type: 'header' | 'paragraph' | 'bullet' | 'spacer';
  content: React.ReactNode;
}

const processBoldText = (text: string): React.ReactNode[] => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index} className="font-bold">{content}</strong>;
    }
    return part;
  });
};

const processEmojis = (text: string): string => {
  // Keep emojis as is, just return the text
  return text;
};

const processLine = (line: string, index: number): ProcessedBlock => {
  // Handle headers
  if (line.startsWith('### ')) {
    const content = line.slice(4);
    return {
      type: 'header',
      content: (
        <h3 key={index} className="text-lg font-bold mb-3">
          {processBoldText(processEmojis(content))}
        </h3>
      )
    };
  }

  // Handle bullet points
  if (line.trim().startsWith('- ')) {
    const content = line.trim().slice(2);
    return {
      type: 'bullet',
      content: (
        <div key={index} className="flex items-start mb-2">
          <span className="mr-2 select-none">•</span>
          <span>{processBoldText(processEmojis(content))}</span>
        </div>
      )
    };
  }

  // Handle empty lines
  if (!line.trim()) {
    return {
      type: 'spacer',
      content: <div key={index} className="h-2" />
    };
  }

  // Handle regular paragraphs
  return {
    type: 'paragraph',
    content: (
      <p key={index} className="mb-3">
        {processBoldText(processEmojis(line))}
      </p>
    )
  };
};

const processText = (text: string): ProcessedBlock[] => {
  const lines = text.split('\n');
  return lines.map((line, index) => processLine(line, index));
};

export function FormattedChatMessage({ message, isUser, timestamp }: FormattedMessageProps) {
  const blocks = processText(message);

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
        <div className="text-sm leading-relaxed">
          {blocks.map((block, index) => (
            <React.Fragment key={index}>
              {block.content}
            </React.Fragment>
          ))}
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