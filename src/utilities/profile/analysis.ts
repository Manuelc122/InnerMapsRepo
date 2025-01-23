import type { ProfileAnalysis } from '../../types/profile';
import { generateChatResponse } from '../chat';
import { createAnalysisPrompt } from './prompts';

const DEFAULT_ANALYSIS: ProfileAnalysis = {
  emotionalPatterns: "Start journaling to reveal your emotional patterns",
  growthAreas: "Share your thoughts to discover growth opportunities",
  currentFocus: "Your journey begins with your first entry",
  strengths: "Your unique story will reveal your strengths",
  lastUpdated: new Date(),
  suggestedTopics: []
};

export async function analyzeUserData(userData: {
  journalEntries: Array<{ content: string; timestamp: Date }>;
  chatMessages: Array<{ content: string; timestamp: Date; isUser: boolean }>;
}): Promise<ProfileAnalysis> {
  try {
    const recentJournalEntries = userData.journalEntries
      .slice(-5)
      .map(entry => `[${entry.timestamp.toISOString()}] ${entry.content}`);

    const recentChatMessages = userData.chatMessages
      .slice(-10)
      .map(msg => `[${msg.timestamp.toISOString()}] ${msg.isUser ? 'User' : 'AI'}: ${msg.content}`);

    if (recentJournalEntries.length === 0 && recentChatMessages.length === 0) {
      return DEFAULT_ANALYSIS;
    }

    const prompt = createAnalysisPrompt(recentJournalEntries, recentChatMessages);
    const response = await generateChatResponse(prompt);

    try {
      const analysis = JSON.parse(response.content);
      return {
        emotionalPatterns: analysis.emotionalPatterns || DEFAULT_ANALYSIS.emotionalPatterns,
        growthAreas: analysis.growthAreas || DEFAULT_ANALYSIS.growthAreas,
        currentFocus: analysis.currentFocus || DEFAULT_ANALYSIS.currentFocus,
        strengths: analysis.strengths || DEFAULT_ANALYSIS.strengths,
        suggestedTopics: analysis.suggestedTopics || [],
        lastUpdated: new Date()
      };
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError);
      return DEFAULT_ANALYSIS;
    }
  } catch (error) {
    console.error('Error analyzing user data:', error);
    return DEFAULT_ANALYSIS;
  }
}