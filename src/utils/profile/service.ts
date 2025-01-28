import { supabase } from '../supabase';
import { getChatHistory } from '../chat';
import { getJournalEntries } from '../journal';
import { analyzeUserData } from './analysis';
import type { ProfileAnalysis } from '../../types/profile';

const DEFAULT_ANALYSIS: ProfileAnalysis = {
  emotionalPatterns: "Start journaling to reveal your emotional patterns",
  growthAreas: "Share your thoughts to discover growth opportunities",
  currentFocus: "Your journey begins with your first entry",
  strengths: "Your unique story will reveal your strengths",
  lastUpdated: new Date(),
  suggestedTopics: []
};

export async function generateProfileAnalysis(): Promise<ProfileAnalysis> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return DEFAULT_ANALYSIS;
    }

    const [chatHistory, journalEntries] = await Promise.all([
      getChatHistory(),
      getJournalEntries()
    ]);

    if (journalEntries.length === 0 && chatHistory.length === 0) {
      return DEFAULT_ANALYSIS;
    }

    const userData = {
      chatMessages: chatHistory.map(msg => ({
        content: msg.content,
        isUser: msg.isUser,
        timestamp: msg.timestamp
      })),
      journalEntries: journalEntries.map(entry => ({
        content: entry.content,
        timestamp: entry.timestamp
      }))
    };

    return await analyzeUserData(userData);
  } catch (error) {
    console.error('Error generating profile analysis:', error);
    return DEFAULT_ANALYSIS;
  }
}