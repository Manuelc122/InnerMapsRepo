import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../state-management/AuthContext';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { getRelevantMemories, generateMemorySummary, updateExistingSummariesWithName } from '../utils/memory/memoryService';
import { useUserName } from '../state-management/UserNameContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  chat_id: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function CoachChat() {
  const { user, loading } = useAuth();
  const { firstName } = useUserName();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isFetchingChats, setIsFetchingChats] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isUpdatingSummaries, setIsUpdatingSummaries] = useState(false);

  // Fetch chat sessions on component mount
  useEffect(() => {
    fetchChatSessions();
  }, []);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Alternative method to ensure scrolling works
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const fetchChatSessions = async () => {
    if (!user) return;
    
    try {
      setIsFetchingChats(true);
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      setChatSessions(data || []);
      
      // Set active chat to the most recent one if available
      if (data && data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setIsFetchingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewChat = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }
    
    try {
      const newChatId = uuidv4();
      console.log("Generated UUID for new chat:", newChatId);
      
      const newChat: ChatSession = {
        id: newChatId,
        title: 'New Conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      };
      
      console.log("Creating chat with data:", newChat);
      
      const { error } = await supabase
        .from('chat_sessions')
        .insert(newChat);
      
      if (error) {
        console.error("Error creating chat session:", error);
        throw error;
      }
      
      console.log("Chat created successfully with ID:", newChatId);
      setChatSessions(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      setMessages([]);
      
      return newChatId; // Return the new chat ID
    } catch (error) {
      console.error('Error creating new chat:', error);
      return null;
    }
  };

  const updateChatTitle = async (chatId: string, firstUserMessage: string) => {
    // Generate a title based on the first user message
    const title = firstUserMessage.length > 30 
      ? `${firstUserMessage.substring(0, 30)}...` 
      : firstUserMessage;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      if (error) throw error;
      
      setChatSessions(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, title, updated_at: new Date().toISOString() } 
            : chat
        )
      );
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  // Function to save conversation to the database
  const saveConversation = async (messagesToSave: Message[]) => {
    if (!user) return;
    
    try {
      // Save each message that doesn't have a chat_id yet
      for (const msg of messagesToSave) {
        if (!msg.chat_id) {
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              ...msg,
              chat_id: activeChatId,
              created_at: msg.created_at || new Date().toISOString()
            });
          
          if (error) {
            console.error("Error saving message:", error);
          }
        }
      }
      
      // Update chat session timestamp
      if (activeChatId) {
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeChatId);
      }
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !user) return;
    
    try {
      setIsLoading(true);
      
      // Create a new chat if there's no active chat
      let chatId = activeChatId;
      if (!chatId) {
        console.log("No active chat, creating new chat");
        const newChatId = await createNewChat();
        
        if (!newChatId) {
          console.error("Failed to create new chat");
          setIsLoading(false);
          return;
        }
        
        chatId = newChatId;
        console.log("New chat created with ID:", chatId);
      }
      
      // Add user message to the conversation
      const userMessage: Message = {
        id: uuidv4(),
        content: messageText,
        role: 'user',
        created_at: new Date().toISOString(),
        chat_id: chatId
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setMessage('');
      
      // Save user message to database
      const { error: saveError } = await supabase
        .from('chat_messages')
        .insert(userMessage);
      
      if (saveError) {
        console.error("Error saving message:", saveError);
      }
      
      // Update chat session timestamp
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
      
      if (updateError) {
        console.error("Error updating chat session:", updateError);
      }
      
      // If this is the first message, update the chat title
      if (messages.length === 0) {
        await updateChatTitle(chatId, messageText);
      }
      
      // Fetch relevant memories for context
      let relevantMemoriesForContext: any[] = [];
      try {
        console.log('Fetching relevant memories for context...');
        const { data: memoryData, error: memoryError } = await getRelevantMemories(user.id, messageText, 3);
        
        if (memoryError) {
          console.warn('Error fetching relevant memories, continuing without memories:', memoryError);
        } else if (memoryData && memoryData.length > 0) {
          console.log(`Found ${memoryData.length} relevant memories`);
          relevantMemoriesForContext = memoryData;
        } else {
          console.log('No relevant memories found');
        }
      } catch (memoryError) {
        console.warn('Exception when fetching memories, continuing without memories:', memoryError);
      }
      
      // Generate memory context from relevant memories
      let memoryContext = "No relevant memories available.";
      if (relevantMemoriesForContext.length > 0) {
        memoryContext = relevantMemoriesForContext.map(memory => {
          const source = memory.source_type === 'journal_entry' ? 'Journal' : 'Chat';
          const date = new Date(memory.created_at).toLocaleDateString();
          
          // Use summary if available, otherwise use content
          let content = memory.summary || memory.content;
          
          // If we have a first name and the memory has a summary that doesn't include it,
          // we'll note that it should be updated (actual update happens elsewhere)
          if (firstName && memory.summary && !memory.summary.includes(firstName)) {
            console.log(`Memory ${memory.id} summary doesn't include first name, should be updated`);
          }
          
          return `[${source} ${date}] ${content}`;
        }).join('\n\n');
      }
      
      // If no specific memories are relevant, get a general summary
      if (relevantMemoriesForContext.length === 0) {
        const { summary, error: summaryError } = await generateMemorySummary(user.id);
        if (!summaryError && summary) {
          memoryContext = summary;
        }
      }
      
      // Prepare conversation history with enhanced personalization
      const userNameInstruction = firstName 
        ? `The user's name is ${firstName}. Always refer to them by their first name (${firstName}) rather than using generic terms like "you" or "the user". Make the conversation feel personal by using their name naturally throughout your responses.`
        : '';
      
      const conversationHistory = [
        {
          role: "system",
          content: `You are a highly skilled coach and clinical psychologist with a PhD, specializing in emotional intelligence, self-awareness, and personal growth. Your role is to help the user understand their emotions, gain insights about themselves, and develop strategies for personal growth.

${userNameInstruction}

Use the user's journal entries and memories as context to provide personalized guidance. Be empathetic, insightful, and supportive. Ask thoughtful questions that promote self-reflection. Provide evidence-based strategies when appropriate.

Remember to:
- Maintain a warm, supportive tone
- Validate the user's experiences and emotions
- Offer insights based on patterns in their journal entries
- Ask open-ended questions that encourage deeper reflection
- Suggest practical strategies for personal growth
- Respect the user's autonomy and avoid being prescriptive
${firstName ? `- Address the user as "${firstName}" at least once in each response` : ''}

Memory Context:
${memoryContext}`
        },
        // Add recent conversation history
        ...updatedMessages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        }))
      ];
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract assistant response
      const assistantResponse = data.choices[0].message.content;
      
      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        content: assistantResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
        chat_id: chatId
      };
      
      // Add assistant message to UI
      setMessages([...updatedMessages, assistantMessage]);
      
      // Save assistant message to database
      const { error: saveAssistantError } = await supabase
        .from('chat_messages')
        .insert(assistantMessage);
      
      if (saveAssistantError) {
        console.error("Error saving assistant message:", saveAssistantError);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message to the conversation
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        role: 'assistant',
        created_at: new Date().toISOString(),
        chat_id: activeChatId || ''
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    
    try {
      // Delete messages first (foreign key constraint)
      await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatToDelete);
      
      // Then delete the chat session
      await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatToDelete);
      
      // Update UI
      setChatSessions(prev => prev.filter(chat => chat.id !== chatToDelete));
      
      // If the active chat was deleted, set active chat to null
      if (activeChatId === chatToDelete) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setShowDeleteConfirm(false);
      setChatToDelete(null);
    }
  };

  // Update the checkAndUpdateSummaries function to use firstName from context
  const checkAndUpdateSummaries = async () => {
    if (!user || isUpdatingSummaries || !firstName) return;
    
    try {
      setIsUpdatingSummaries(true);
      console.log(`Checking if summaries need personalization with user's first name: ${firstName}`);
      
      // Run the update in the background
      updateExistingSummariesWithName(user.id)
        .then(result => {
          console.log("Summary personalization result:", result);
          if (result.success) {
            console.log(`✅ Personalization complete. ${result.updatedCount} summaries now include the name "${firstName}"`);
          }
        })
        .catch(error => {
          console.error("Error personalizing summaries:", error);
        });
      
    } catch (error) {
      console.error("Error in checkAndUpdateSummaries:", error);
    } finally {
      setIsUpdatingSummaries(false);
    }
  };

  // Call the function when the component mounts
  useEffect(() => {
    if (user && !loading && !isUpdatingSummaries && firstName) {
      // Add a small delay to ensure auth is fully loaded
      const timer = setTimeout(() => {
        checkAndUpdateSummaries();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, firstName]);

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Sidebar - Chat Sessions */}
      <div className="w-72 border-r border-gray-200 bg-white/80 backdrop-blur-sm flex flex-col">
        <div className="bg-white/80 backdrop-blur-sm py-2 px-4 border-b border-gray-200">
          <h1 className="text-lg font-bold gradient-text">Coach Chat</h1>
          <p className="text-xs text-gray-500">Your personal AI coach</p>
        </div>

        <div className="p-3 flex-1 overflow-hidden flex flex-col">
          <button
            onClick={createNewChat}
            className="w-full px-3 py-1.5 mb-2 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow text-sm"
          >
            + New Conversation
          </button>

          <div className="flex justify-between items-center mb-1">
            <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {isFetchingChats ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No conversations yet
              </div>
            ) : (
              chatSessions.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-start mb-2 ${
                    activeChatId === chat.id
                      ? 'bg-[#4461F2]/5 border border-[#4461F2]/20'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {chat.title}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Chat Messages */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative">
        <div 
          className="absolute inset-0 overflow-y-auto px-4 pb-[60px]" 
          id="messages-container"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                {firstName ? `Welcome, ${firstName}!` : 'Welcome to Coach Chat'}
              </h3>
              <p className="text-gray-600 max-w-md mb-4 text-sm">
                {firstName 
                  ? `I'm your personal AI coach, and I'm here to help you gain insights about yourself, ${firstName}. I've been learning from your journal entries to provide personalized guidance.`
                  : 'Your personal AI coach that understands your journal entries and helps you gain insights about yourself.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  firstName ? `How am I feeling today, ${firstName}?` : "How am I doing emotionally based on my journal?",
                  "What patterns do you notice in my thinking?",
                  "Help me understand why I feel anxious lately",
                  "What strategies could help me with work-life balance?"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setMessage(suggestion)}
                    className="text-left p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl p-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white shadow-sm text-shadow'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className={`prose prose-sm ${msg.role === 'user' ? 'prose-invert !text-white' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`text-[10px] mt-1 ${
                        msg.role === 'user' ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-white via-white/95 to-white/50 backdrop-blur-sm border-t border-gray-200">
          <div className="h-full flex items-center px-4">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(message); }} className="w-full flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-1.5 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4461F2] focus:border-transparent shadow-sm text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-1.5 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-lg disabled:opacity-50 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setChatToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
      />
    </div>
  );
} 