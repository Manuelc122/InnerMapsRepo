import { supabase } from './supabase';

export async function updateStreak() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) return null;

    // Get all entries
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (!entries?.length) return null;

    // Convert all dates to midnight timestamps in user's timezone for accurate comparison
    const dates = entries.map(entry => {
      const date = new Date(entry.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    // Get unique dates and sort them in descending order (newest first)
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
    
    // Calculate current streak by checking consecutive days
    let currentStreak = 1; // Start with 1 for today
    const msPerDay = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const currentDate = uniqueDates[i];
      const nextDate = uniqueDates[i + 1];
      
      // Check if dates are consecutive
      if (currentDate - nextDate === msPerDay) {
        currentStreak++;
      } else {
        // Break if we find a gap
        break;
      }
    }

    console.log('Dates found:', uniqueDates.map(ts => new Date(ts).toLocaleDateString()));
    console.log('Calculated streak:', currentStreak);

    // Get or create streak record
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (!streakData) {
      // First time user - create streak record
      const { data } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userData.user.id,
          current_streak: currentStreak,
          longest_streak: currentStreak,
          last_entry_date: entries[0].created_at
        })
        .select()
        .single();

      console.log('Created new streak record:', data);
      return data;
    }

    // Update existing streak
    const { data } = await supabase
      .from('user_streaks')
      .update({
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, streakData.longest_streak || 0),
        last_entry_date: entries[0].created_at,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userData.user.id)
      .select()
      .single();

    console.log('Updated streak record:', data);
    return data;

  } catch (error) {
    console.error('Error updating streak:', error);
    return null;
  }
}

export async function getStreak() {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) return null;

    // First check if we need to update the streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get recent entries
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('created_at')
      .eq('user_id', userData.user.id)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    // Get current streak data
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_entry_date, updated_at')
      .eq('user_id', userData.user.id)
      .single();

    if (recentEntries && recentEntries.length > 0) {
      const lastEntryDate = new Date(recentEntries[0].created_at);
      lastEntryDate.setHours(0, 0, 0, 0);

      // If we have a recent entry but streak is 0, update it
      if (streakData && streakData.current_streak === 0) {
        console.log('Found recent entries but streak is 0, updating...');
        return await updateStreak();
      }

      // If the last entry date doesn't match what we have stored, update
      if (streakData && streakData.last_entry_date) {
        const storedLastEntry = new Date(streakData.last_entry_date);
        storedLastEntry.setHours(0, 0, 0, 0);

        if (storedLastEntry.getTime() !== lastEntryDate.getTime()) {
          console.log('Last entry date mismatch, updating streak...');
          return await updateStreak();
        }
      }
    }

    return streakData;
  } catch (error) {
    console.error('Error getting streak:', error);
    return null;
  }
} 