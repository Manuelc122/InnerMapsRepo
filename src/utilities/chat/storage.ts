import { supabase } from '../supabase';
import { withAuth } from '../api';
import type { Message } from './types';

export async function saveChatMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  return withAuth(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          content: message.content,
          is_user: message.isUser
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      return {
        id: data.id,
        content: data.content,
        isUser: data.is_user,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Failed to save chat message:', error);
      throw new Error('Failed to save message. Please try again.');
    }
  });
}

export async function getChatHistory(): Promise<Message[]> {
  return withAuth(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map(message => ({
        id: message.id,
        content: message.content,
        isUser: message.is_user,
        timestamp: new Date(message.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return []; // Return empty array instead of throwing to prevent UI disruption
    }
  });
}

export async function clearChatHistory(): Promise<void> {
  return withAuth(async (userId) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      throw new Error('Failed to clear chat history. Please try again.');
    }
  });
}