import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ErrorAlert } from '../ui/ErrorAlert';
import { ConfirmButton } from '../ui/ConfirmButton';
import { type Message } from '../../lib/chat/types';
import { type JournalEntry } from '../../types';
import { 
  getChatHistory, 
  saveChatMessage, 
  generateChatResponse, 
  clearChatHistory,
  initializeChat 
} from '../../lib/chat';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
}

export function ChatDrawer({ isOpen, onClose, journalEntries }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isLoading, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      setError(null);
      await initializeChat();
      const history = await getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError(new Error('Unable to load chat history. Please try again.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const savedUserMessage = await saveChatMessage({
        content: userMessage,
        isUser: true
      });
      setMessages(prev => [...prev, savedUserMessage]);

      const response = await generateChatResponse(userMessage);
      const savedAiMessage = await saveChatMessage({
        content: response.content,
        isUser: false
      });
      setMessages(prev => [...prev, savedAiMessage]);
    } catch (err) {
      setError(new Error('Failed to send message. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-0 right-4 w-[380px] bg-white rounded-t-xl shadow-xl transition-all duration-300 ${
        isMinimized ? 'h-[48px]' : 'h-[600px]'
      }`}
    >
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">AI Life Coach</h2>
            <p className="text-blue-100 text-xs">
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConfirmButton
            onConfirm={clearChatHistory}
            label="Clear"
            confirmMessage="Clear chat history?"
            variant="ghost"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-120px)]">
            {error && (
              <ErrorAlert 
                title="Chat Error" 
                message={error.message}
                action={{
                  label: 'Retry',
                  onClick: loadChatHistory
                }}
              />
            )}
            
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                isUser={message.isUser}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 pr-12 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}