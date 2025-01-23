import type { UserProfile } from './types';
import { analyzeInteractions } from './analysis';

export async function buildUserProfile(
  journalEntries: Array<{ content: string; timestamp: Date }>,
  chatMessages: Array<{ content: string; isUser: boolean; timestamp: Date }>
): Promise<UserProfile> {
  // Build profile from interactions but don't expose directly
  const profile = await analyzeInteractions(journalEntries, chatMessages);
  
  return {
    communicationStyle: profile.communicationStyle,
    valueThemes: profile.valueThemes,
    growthAreas: profile.growthAreas,
    interests: profile.interests,
    lastUpdated: new Date()
  };
}