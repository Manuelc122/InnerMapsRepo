import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { sendMessage } from '../../store/chatSlice';
import { ChatSession, ChatMessage } from '../../types/chat';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../state-management/AuthContext';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  session: ChatSession;
}

export function ChatInterface({ session }: ChatInterfaceProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(session.messages);
  }, [session.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const trimmedInput = input.trim();
    setInput('');

    try {
      // Create user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmedInput,
        timestamp: new Date().toISOString(),
      };
      
      // Add user message immediately
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Add a pending AI message
      const pendingMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '...',
        timestamp: new Date().toISOString(),
        pending: true
      };
      setMessages(prevMessages => [...prevMessages, pendingMessage]);
      
      // Dispatch the message and get streaming updates
      const response = await dispatch(sendMessage({ 
        sessionId: session.id, 
        content: trimmedInput,
        onStream: (content: string) => {
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.pending) {
              lastMessage.content = content;
            }
            return newMessages;
          });
        }
      })).unwrap();

      // Update messages with the final response
      setMessages(prevMessages => {
        const newMessages = prevMessages.filter(msg => !msg.pending);
        return [...newMessages, response.userMessage, response.assistantMessage];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prevMessages => prevMessages.filter(msg => !msg.pending));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
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
            {message.pending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            ) : (
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
                  code: ({node, className, children, ...props}: any) => {
                    const isInline = !className?.includes('language-');
                    return isInline 
                      ? <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-400' : 'bg-gray-100'}`} {...props}>{children}</code>
                      : <code className={`block p-3 rounded-lg my-2 ${isUser ? 'bg-blue-400' : 'bg-gray-100'}`} {...props}>{children}</code>
                  },
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
            )}
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
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse"
      >
        <div className="flex flex-col">
          {messages.map(renderMessage)}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "Waiting for response..." : "Share what's on your mind..."}
            className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 