import { supabase } from '../supabase';
import { withAuth } from '../api';

export async function clearChatHistory() {
  return withAuth(async (userId) => {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  });
}