import { supabase } from './supabaseClient';

export async function saveJournalEntry(entry: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userData.user.id,
        content: entry
      })
      .select()
      .single();

    if (error) {
      console.error('Save error details:', error);
      throw new Error(`Failed to save: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

export async function deleteJournalEntry(entryId: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .match({ 
        id: entryId,
        user_id: userData.user.id 
      });

    if (error) {
      console.error('Delete error details:', error);
      throw new Error(`Failed to delete: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}