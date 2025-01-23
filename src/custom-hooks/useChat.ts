import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const message = input.value.trim();
    
    if (!message || isLoading) return;

    const userMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    input.value = '';
    setIsLoading(true);

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are Claude, a highly empathetic and emotionally intelligent AI assistant. You excel at:
- Understanding and validating emotions
- Offering genuine, heartfelt responses
- Asking thoughtful questions that lead to self-discovery
- Providing gentle guidance when needed
- Being present and supportive without judgment

Keep your responses natural and conversational, as if talking to a trusted friend. Focus on understanding and connecting rather than solving problems.`
            },
            ...messages,
            userMessage
          ],
          temperature: 0.9,
          max_tokens: 500
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
} 