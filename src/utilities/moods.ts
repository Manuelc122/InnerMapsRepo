import { supabase } from './supabase';

export type Mood = 
  | 'Happy' | 'Calm' | 'Loved' | 'Inspired' | 'Confident' | 'Grateful'
  | 'Sad' | 'Frustrated' | 'Anxious' | 'Hurt' | 'Overwhelmed' | 'Confused'
  | 'Tired' | 'Energetic' | 'Unwell' | 'Strong' | 'Relaxed' | 'Exhausted';

export interface MoodEntry {
  id: string;
  mood: Mood;
  intensity: number;
  energy_level: number;
  created_at: string;
  entry_id: string;
}

export async function saveMood(
  mood: Mood, 
  entryId: string, 
  intensity: number = 3,
  energyLevel: number = 3
) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('journal_moods')
      .insert({
        user_id: userData.user.id,
        entry_id: entryId,
        mood,
        intensity,
        energy_level: energyLevel
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving mood:', error);
    throw error;
  }
}

export async function getMoodHistory(days: number = 30) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('journal_moods')
      .select(`
        id,
        mood,
        intensity,
        notes,
        created_at,
        entry_id
      `)
      .eq('user_id', userData.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching mood history:', error);
    throw error;
  }
}

export async function getMoodStats(days: number = 30) {
  try {
    const moods = await getMoodHistory(days);
    
    const stats = {
      totalEntries: moods.length,
      moodFrequency: {} as Record<Mood, number>,
      averageIntensity: 0,
      mostFrequentMood: null as Mood | null,
      moodTrend: [] as Array<{ date: string; mood: Mood; intensity: number }>
    };

    moods.forEach(mood => {
      // Count frequency
      stats.moodFrequency[mood.mood] = (stats.moodFrequency[mood.mood] || 0) + 1;
      
      // Calculate average intensity
      stats.averageIntensity += mood.intensity;

      // Add to trend data
      stats.moodTrend.push({
        date: mood.created_at,
        mood: mood.mood,
        intensity: mood.intensity
      });
    });

    if (moods.length > 0) {
      stats.averageIntensity /= moods.length;
      stats.mostFrequentMood = Object.entries(stats.moodFrequency)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0] as Mood;
    }

    return stats;
  } catch (error) {
    console.error('Error calculating mood stats:', error);
    throw error;
  }
} 