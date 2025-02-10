import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { sendMessage } from '../../store/chatSlice';
import { ChatSession, ChatMessage } from '../../types/chat';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  session: ChatSession;
}

export function ChatInterface({ session }: ChatInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsTyping(true);
    const messageContent = input.trim();
    setInput('');
    
    try {
      await dispatch(sendMessage({ sessionId: session.id, content: messageContent }));
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-2xl p-4 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-100 shadow-sm'
          }`}
        >
          <div className="text-sm mb-1 flex items-center gap-2">
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs">
                AI
              </div>
            )}
            <span className="text-xs opacity-75">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
          </div>
          <div className={`whitespace-pre-wrap markdown-content ${isUser ? 'text-white' : 'text-gray-700'}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-md font-bold mb-2" {...props} />,
                strong: ({node, ...props}) => (
                  <strong 
                    className={`font-bold ${isUser ? 'text-white' : 'text-gray-900'}`} 
                    {...props}
                  />
                ),
                em: ({node, ...props}) => <em className="italic" {...props} />,
                code: ({node, inline, ...props}) => (
                  inline 
                    ? <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-400' : 'bg-gray-100'}`} {...props} />
                    : <code className={`block p-3 rounded-lg my-2 ${isUser ? 'bg-blue-400' : 'bg-gray-100'}`} {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote 
                    className={`border-l-4 pl-4 my-2 ${
                      isUser ? 'border-blue-400' : 'border-gray-300'
                    }`} 
                    {...props}
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white">
            AI
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Coach</h2>
            <p className="text-sm text-gray-500">
              Your supportive companion for personal growth
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map(renderMessage)}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs">
              AI
            </div>
            <div className="flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 