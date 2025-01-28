import { supabase } from './supabase';
import { withAuth } from './api';
import type { JournalEntry } from '../types';

export async function saveJournalEntry(entry: Omit<JournalEntry, 'id'>) {
  return withAuth(async (userId) => {
    try {
      console.log('Starting to save journal entry:', { content: entry.content });
      
      // Save journal entry
      const { data: journalEntry, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          content: entry.content,
          timestamp: entry.timestamp.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving journal entry:', error);
        throw error;
      }

      console.log('Journal entry saved successfully:', journalEntry);

      return {
        id: journalEntry.id,
        content: journalEntry.content,
        timestamp: new Date(journalEntry.timestamp)
      };
    } catch (error) {
      console.error('Error in saveJournalEntry:', error);
      throw error;
    }
  });
}

export async function getJournalEntries() {
  return withAuth(async (userId) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      content: entry.content,
      timestamp: new Date(entry.timestamp)
    }));
  });
}

export async function deleteJournalEntry(id: string) {
  return withAuth(async (userId) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  });
}