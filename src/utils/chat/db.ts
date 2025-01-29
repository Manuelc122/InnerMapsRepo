import { supabase } from '../supabaseClient';
import { ChatMessage } from './types';

export async function saveChatMessage(message: string, isUser: boolean = true) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userData.user.id,
        message,
        is_user: isUser
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

export async function getChatHistory() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

export async function clearChatHistory() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .match({ 
        id: messageId,
        user_id: userData.user.id 
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
} 