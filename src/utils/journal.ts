import { supabase } from './supabaseClient';

export async function saveJournalEntry(entry: string, entryId?: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    if (entryId) {
      // Update existing entry
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          content: entry,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) {
        console.error('Update error details:', error);
        throw new Error(`Failed to update: ${error.message}`);
      }

      return { data, error: null };
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userData.user.id,
          content: entry,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Save error details:', error);
        throw new Error(`Failed to save: ${error.message}`);
      }

      return { data, error: null };
    }
  } catch (error) {
    console.error('Save/Update error:', error);
    return { data: null, error };
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