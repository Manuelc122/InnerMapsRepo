import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Lightbulb, Send } from 'lucide-react';

export function EnhancedChat() {
  const { messages, sendMessage, isLoading } = useChat();
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center mr-2">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.isUser
                  ? 'bg-blue-500 text-black ml-auto rounded-br-none'
                  : 'bg-gray-100 text-black rounded-bl-none'
              }`}
            >
              <div className="prose prose-sm max-w-none prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black">
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2 text-black">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-4 mb-2 text-black">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1 text-black">{children}</li>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0 text-black">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-black">{children}</strong>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.timestamp && (
                <div
                  className={`text-xs mt-1 ${
                    message.isUser ? 'text-black/70' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                </div>
              )}
            </div>
            {message.isUser && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-2">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-black">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:border-blue-500 text-black placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 