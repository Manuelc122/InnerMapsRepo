import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateChatResponse } from '../../lib/chat/service';
import { buildConversationContext } from '../../lib/chat/context';
import type { ConversationContext, Message } from '../../lib/chat/types';
import { v4 as uuidv4 } from 'uuid';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ConversationContext | undefined>();

  useEffect(() => {
    // Initialize context when chat opens
    if (isOpen) {
      buildConversationContext().then(newContext => {
        setContext(newContext);
        // Initialize messages from context if available
        if (newContext?.recentMessages) {
          setMessages(newContext.recentMessages);
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: message,
      isUser: true,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await generateChatResponse(message, context);
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: response.content,
        isUser: false,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Update context with the new messages
      if (context) {
        setContext(prev => {
          if (!prev) return prev;
          
          const newMessages = [...prev.recentMessages, userMessage, aiMessage].slice(-5);
          
          return {
            ...prev,
            recentMessages: newMessages
          };
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error. Please try again.",
        isUser: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-[#4461F2] text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-[#4461F2] text-white flex justify-between items-center">
              <h3 className="font-medium">AI Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.isUser
                        ? 'bg-[#4461F2] text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-2 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#4461F2] focus:ring-[#4461F2]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="absolute right-2 top-2 p-1 text-[#4461F2] hover:text-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}