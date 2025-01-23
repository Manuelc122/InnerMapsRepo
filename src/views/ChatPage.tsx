import React, { useState, useEffect, useRef } from 'react';
import { 
  getChatHistory, 
  saveChatMessage, 
  generateChatResponse,
  type ChatMessage,
  deleteMessage
} from '../lib/chat';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Sparkles, Send, Loader2, ChevronDown, Trash2, 
  Smile, Lightbulb, Heart, Target, Waves, ArrowRight
} from 'lucide-react';
import { getJournalEntries } from '../lib/journal';
import type { JournalEntry } from '../types';

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [suggestedTopics, setSuggestedTopics] = useState([
    'Tell me about your recent challenges',
    'What are your current goals?',
    'How are you feeling today?',
    'What patterns have you noticed lately?'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [messageHover, setMessageHover] = useState<string | null>(null);
  const controls = useAnimation();

  useEffect(() => {
    loadChatHistory();
    loadJournalEntries();
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isNotAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const entries = await getJournalEntries();
      setJournalEntries(entries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Save user message
      const userMessage = await saveChatMessage(newMessage, true);
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // Show typing indicator immediately
      const tempId = 'typing-' + Date.now();
      setMessages(prev => [...prev, {
        id: tempId,
        message: '...',
        is_user: false,
        created_at: new Date().toISOString()
      }]);

      // Get AI response with context
      const context = {
        recentMessages: messages.slice(-5).map(msg => ({
          content: msg.message,
          isUser: msg.is_user
        })),
        journalEntries: journalEntries.slice(0, 5).map(entry => ({
          content: entry.content,
          timestamp: entry.timestamp
        }))
      };
      
      const aiResponse = await generateChatResponse(newMessage, context);
      
      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(m => m.id !== tempId));
      const aiMessage = await saveChatMessage(aiResponse.content, false);
      setMessages(prev => [...prev, aiMessage]);

      // Update suggested topics based on conversation
      updateSuggestedTopics(aiResponse.content);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const updateSuggestedTopics = (aiResponse: string) => {
    // Simple logic to update topics based on keywords in the response
    const topics = [
      'Explore your feelings about this further',
      'Discuss any patterns you\'ve noticed',
      'Share your thoughts on next steps',
      'Reflect on what you\'ve learned'
    ];
    setSuggestedTopics(topics);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return isToday 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Add ripple effect when sending messages
  const triggerRipple = async () => {
    await controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 relative">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          {/* Enhanced Header with Interactive Elements */}
          <div className="p-6 border-b border-gray-100 bg-white/90 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <Sparkles className="w-6 h-6 text-white relative z-10" />
              </motion.div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  Life Coach Chat
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block"
                  >
                    ✨
                  </motion.span>
                </h2>
                <p className="text-sm text-gray-500">Get guidance and support for your personal growth journey</p>
              </div>
            </div>
          </div>

          {/* Messages Area with Enhanced Interactions */}
          <div 
            ref={messagesContainerRef}
            className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-gray-50/50 custom-scrollbar relative"
          >
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center max-w-md p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-2xl">👋</span>
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Your Personal Life Coach</h3>
                    <p className="text-gray-600 mb-6">I'm here to support your journey of personal growth and self-discovery. What would you like to explore today?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {suggestedTopics.map((topic, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setNewMessage(topic)}
                          className="p-3 text-sm text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          {topic}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onHoverStart={() => setMessageHover(msg.id)}
                    onHoverEnd={() => setMessageHover(null)}
                    className={`flex group ${msg.is_user ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.is_user && (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4 mt-2 shadow-md"
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    <motion.div
                      animate={controls}
                      className="relative max-w-[80%]"
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-2xl p-4 hover:group ${
                          msg.is_user
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-100'
                        } shadow-lg transition-shadow duration-200`}
                      >
                        {msg.id.startsWith('typing-') ? (
                          <div className="flex space-x-2 h-6 items-center px-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              {/* Single Delete Button */}
                              <AnimatePresence>
                                {messageHover === msg.id && !msg.id.startsWith('typing-') && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMessageToDelete(msg.id)}
                                    className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all duration-200 ${
                                      msg.is_user 
                                        ? 'bg-blue-400 hover:bg-blue-500' 
                                        : 'bg-white/80 backdrop-blur-sm hover:bg-red-50'
                                    }`}
                                  >
                                    <Trash2 className={`w-3 h-3 ${
                                      msg.is_user 
                                        ? 'text-white' 
                                        : 'text-gray-400 hover:text-red-500'
                                    } transition-colors`} />
                                  </motion.button>
                                )}
                              </AnimatePresence>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            </div>
                            <span className={`text-xs ${msg.is_user ? 'text-blue-100' : 'text-gray-400'} mt-2 block`}>
                              {formatTimestamp(msg.created_at)}
                            </span>
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-24 right-8 p-2 bg-gray-900/80 text-white rounded-full shadow-lg backdrop-blur-sm hover:bg-gray-900 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Enhanced Input Area with Dynamic Effects */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t border-gray-100 bg-white/80 backdrop-blur-lg p-6"
          >
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full pr-16 pl-4 py-4 text-gray-600 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none transition-all shadow-sm hover:shadow-md"
                disabled={isLoading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <motion.button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                ) : (
                  <ArrowRight className="w-5 h-5 relative z-10" />
                )}
              </motion.button>
            </form>

            {/* Enhanced keyboard shortcuts display */}
            <div className="mt-2 flex justify-between items-center px-1">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Press</span>
                <kbd className="px-2 py-0.5 bg-gray-50 rounded-md text-gray-500 border border-gray-200 shadow-sm">Enter</kbd>
                <span>to send,</span>
                <kbd className="px-2 py-0.5 bg-gray-50 rounded-md text-gray-500 border border-gray-200 shadow-sm">Shift + Enter</kbd>
                <span>for new line</span>
              </div>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-gray-400"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-3 h-3" />
                  </motion.div>
                  AI is thinking...
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Delete Modal */}
      <AnimatePresence>
        {messageToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl border border-gray-100"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trash2 className="w-6 h-6 text-red-500" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Message</h3>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMessageToDelete(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (messageToDelete) {
                      handleDeleteMessage(messageToDelete);
                      setMessageToDelete(null);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 