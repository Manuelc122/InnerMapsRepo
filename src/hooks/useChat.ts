import { useState, useEffect } from 'react';
import { getJournalEntries } from '../utils/journal';

interface TextBlock {
  type: 'header' | 'paragraph' | 'list-item' | 'emphasis';
  content: string;
  level?: number;  // For headers (1-6)
  format?: {
    bold?: boolean;
    italic?: boolean;
    bullet?: boolean;
  };
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  blocks?: TextBlock[];
}

interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  mood?: string;
}

interface RawJournalEntry {
  id: any;
  content: any;
  timestamp: Date;
  mood?: string;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a warm and empathetic AI assistant with access to the user's recent journal entries. Use this context to provide more personalized and relevant responses while maintaining a natural conversation flow. When appropriate, reference patterns or insights from their journal entries to provide deeper, more meaningful support.

Remember to:
- Keep responses natural and conversational
- Use journal context thoughtfully and respectfully
- Maintain empathy and understanding
- Provide personalized insights when relevant`;

const parseMarkdown = (text: string): TextBlock[] => {
  // Split text into lines while preserving empty lines for paragraph breaks
  const lines = text.split('\n');
  const blocks: TextBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({
        type: 'paragraph',
        content: currentParagraph.join(' ').trim()
      });
      currentParagraph = [];
    }
  };

  for (let line of lines) {
    line = line.trim();
    
    // Handle headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      blocks.push({
        type: 'header',
        content: headerMatch[2].trim(),
        level: headerMatch[1].length
      });
      continue;
    }

    // Handle bullet points
    if (line.startsWith('- ')) {
      flushParagraph();
      blocks.push({
        type: 'list-item',
        content: line.slice(2).trim(),
        format: { bullet: true }
      });
      continue;
    }

    // Handle bold text
    if (line.includes('**')) {
      flushParagraph();
      blocks.push({
        type: 'emphasis',
        content: line.replace(/\*\*/g, '').trim(),
        format: { bold: true }
      });
      continue;
    }

    // Handle empty lines as paragraph breaks
    if (line === '') {
      flushParagraph();
      continue;
    }

    // Accumulate regular paragraph text
    currentParagraph.push(line);
  }

  // Don't forget to flush any remaining paragraph text
  flushParagraph();

  return blocks;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    try {
      const entries = await getJournalEntries() as RawJournalEntry[];
      // Ensure entries have the correct type
      const formattedEntries: JournalEntry[] = entries.slice(0, 10).map(entry => ({
        id: String(entry.id),
        content: String(entry.content),
        timestamp: entry.timestamp.toISOString(),
        mood: entry.mood
      }));
      setRecentEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    const timestamp = formatTimestamp();

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Prepare the conversation history including journal context
      const conversationHistory = [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        // Add journal context
        {
          role: "system",
          content: `Recent journal entries:\n${recentEntries
            .map(entry => `[${entry.timestamp}] ${entry.content}${entry.mood ? ` (Mood: ${entry.mood})` : ''}`)
            .join('\n')}`
        },
        // Add recent conversation history
        ...messages.slice(-5).map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        // Add current message
        {
          role: "user",
          content: content
        }
      ];

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: conversationHistory,
          temperature: 0.9,
          max_tokens: 500,
          presence_penalty: 0.8,
          frequency_penalty: 0.8
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.choices[0].message.content,
          isUser: false,
          timestamp: formatTimestamp()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Could you try again in a moment? 🙏",
        isUser: false,
        timestamp: formatTimestamp()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    recentEntries,
    clearMessages
  };
} 