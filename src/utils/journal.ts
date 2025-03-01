import { supabase } from './supabaseClient';
import { updateExistingSummariesWithName } from './memory/memoryService';

export async function saveJournalEntry(entry: string, entryId?: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    let result;
    
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
      
      result = { data, error: null };
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
      
      result = { data, error: null };
      
      // After creating a new journal entry, check for duplicate memories and clean them up
      try {
        console.log('Checking for duplicate memories...');
        // Wait a moment for the database trigger to create the memory
        setTimeout(async () => {
          try {
            // Check if multiple memories were created for this journal entry
            const { data: memories, error: memoriesError } = await supabase
              .from('coach_memories')
              .select('*')
              .eq('source_id', data.id)
              .eq('source_type', 'journal_entry');
              
            if (memoriesError) {
              console.error('Error checking for memories:', memoriesError);
              return;
            }
            
            console.log(`Found ${memories?.length || 0} memories for journal entry ${data.id}`);
            
            // If more than one memory was created, keep only the first one and delete the rest
            if (memories && memories.length > 1) {
              console.log('Detected duplicate memories. Cleaning up...');
              
              // Keep the first memory (oldest one)
              const memoryToKeep = memories[0];
              
              // Delete the duplicate memories
              for (let i = 1; i < memories.length; i++) {
                const { error: deleteError } = await supabase
                  .from('coach_memories')
                  .delete()
                  .eq('id', memories[i].id);
                  
                if (deleteError) {
                  console.error(`Error deleting duplicate memory ${memories[i].id}:`, deleteError);
                } else {
                  console.log(`Successfully deleted duplicate memory ${memories[i].id}`);
                }
              }
            }
            
            // Now personalize the summaries
            const personalizationResult = await updateExistingSummariesWithName(userData.user.id);
            console.log('Summary personalization result:', personalizationResult);
          } catch (error) {
            console.error('Error handling memories:', error);
          }
        }, 2000); // Wait 2 seconds for the database trigger to create the memory
      } catch (error) {
        // Just log the error, don't affect the main flow
        console.error('Error checking for duplicate memories:', error);
      }
    }
    
    return result;
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