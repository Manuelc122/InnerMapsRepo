import { supabase } from './supabase';
import { Mood } from './moods';
import { analyzeJournalContent, PersonalityProfile } from './deepseek';

export interface AnalyticsData {
  // Metadata
  lastAnalyzedAt: string;
  lastAnalyzedEntryCount: number;
  
  // Entry Statistics
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  entriesPerDay: Record<string, number>;
  
  // Mood Statistics
  moodDistribution: Record<Mood, number>;
  moodsByCategory: {
    positive: number;
    challenging: number;
    energy: number;
  };
  averageMoodIntensity: number;
  averageEnergyLevel: number;
  
  // Time Patterns
  timeOfDayDistribution: {
    morning: number;   // 5-11
    afternoon: number; // 12-16
    evening: number;   // 17-20
    night: number;     // 21-4
  };
  
  // Trends
  intensityOverTime: Array<{ date: string; intensity: number }>;
  energyOverTime: Array<{ date: string; energy: number }>;
  wordCountOverTime: Array<{ date: string; count: number }>;
  
  // Qualitative Analysis
  thoughtPatterns: string[];
  coreValues: string[];
  growthAreas: string[];
  strengths: string[];
  personalityProfile: PersonalityProfile;
}

export async function getAnalytics(days: number = 30): Promise<AnalyticsData | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // Get entries for the specified timeframe
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: entries, error: entriesError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        journal_moods (
          mood,
          intensity,
          energy_level
        )
      `)
      .eq('user_id', user.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (entriesError) throw entriesError;
    if (!entries || entries.length === 0) {
      return null;
    }

    // Initialize analytics object
    const analytics: AnalyticsData = {
      lastAnalyzedAt: new Date().toISOString(),
      lastAnalyzedEntryCount: entries.length,
      totalEntries: entries.length,
      totalWords: 0,
      averageWordsPerEntry: 0,
      entriesPerDay: {},
      moodDistribution: {} as Record<Mood, number>,
      moodsByCategory: {
        positive: 0,
        challenging: 0,
        energy: 0
      },
      averageMoodIntensity: 0,
      averageEnergyLevel: 0,
      timeOfDayDistribution: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      intensityOverTime: [],
      energyOverTime: [],
      wordCountOverTime: [],
      thoughtPatterns: [],
      coreValues: [],
      growthAreas: [],
      strengths: [],
      personalityProfile: {
        summary: '',
        keyTraits: [],
        motivations: [],
        challenges: [],
        growthJourney: ''
      }
    };

    let totalIntensity = 0;
    let totalEnergy = 0;
    let moodCount = 0;

    entries.forEach(entry => {
      // Word count analysis
      const wordCount = entry.content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      analytics.totalWords += wordCount;

      // Time of day analysis
      const entryDate = new Date(entry.created_at);
      const hour = entryDate.getHours();
      if (hour >= 5 && hour <= 11) analytics.timeOfDayDistribution.morning++;
      else if (hour >= 12 && hour <= 16) analytics.timeOfDayDistribution.afternoon++;
      else if (hour >= 17 && hour <= 20) analytics.timeOfDayDistribution.evening++;
      else analytics.timeOfDayDistribution.night++;

      // Daily entry count
      const dateKey = entryDate.toISOString().split('T')[0];
      analytics.entriesPerDay[dateKey] = (analytics.entriesPerDay[dateKey] || 0) + 1;

      // Mood analysis
      const mood = entry.journal_moods?.[0];
      if (mood) {
        // Mood distribution
        const moodKey = mood.mood as Mood;
        analytics.moodDistribution[moodKey] = (analytics.moodDistribution[moodKey] || 0) + 1;

        // Category distribution
        const category = getMoodCategory(mood.mood);
        analytics.moodsByCategory[category]++;

        // Intensity and energy tracking
        if (mood.intensity) {
          totalIntensity += mood.intensity;
          analytics.intensityOverTime.push({
            date: dateKey,
            intensity: mood.intensity
          });
        }
        if (mood.energy_level) {
          totalEnergy += mood.energy_level;
          analytics.energyOverTime.push({
            date: dateKey,
            energy: mood.energy_level
          });
        }
        moodCount++;
      }

      // Word count over time
      analytics.wordCountOverTime.push({
        date: dateKey,
        count: wordCount
      });
    });

    // Calculate averages
    analytics.averageWordsPerEntry = Math.round(analytics.totalWords / analytics.totalEntries);
    analytics.averageMoodIntensity = moodCount ? Math.round((totalIntensity / moodCount) * 10) / 10 : 0;
    analytics.averageEnergyLevel = moodCount ? Math.round((totalEnergy / moodCount) * 10) / 10 : 0;

    // Get qualitative analysis from DeepSeek
    const combinedContent = entries.map(entry => entry.content).join('\n\n');
    const qualitativeAnalysis = await analyzeJournalContent(combinedContent);

    // Merge qualitative analysis with analytics
    return {
      ...analytics,
      ...qualitativeAnalysis
    };

  } catch (error) {
    console.error('Error getting analytics:', error);
    return null;
  }
}

function getMoodCategory(mood: Mood): 'positive' | 'challenging' | 'energy' {
  const categories = {
    positive: ['Happy', 'Calm', 'Loved', 'Inspired', 'Confident', 'Grateful'],
    challenging: ['Sad', 'Frustrated', 'Anxious', 'Hurt', 'Overwhelmed', 'Confused'],
    energy: ['Tired', 'Energetic', 'Unwell', 'Strong', 'Relaxed', 'Exhausted']
  };

  if (categories.positive.includes(mood)) return 'positive';
  if (categories.challenging.includes(mood)) return 'challenging';
  return 'energy';
} 