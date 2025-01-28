import { type ConversationContext } from './types';
import { getJournalEntries } from '../journal';

export async function buildConversationContext(): Promise<ConversationContext> {
  try {
    const journalEntries = await getJournalEntries();
    const recentEntries = journalEntries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5); // Get 5 most recent entries

    return {
      recentMessages: [],
      journalEntries: recentEntries.map(entry => ({
        content: entry.content,
        timestamp: entry.timestamp
      }))
    };
  } catch (error) {
    console.error('Error building conversation context:', error);
    return { recentMessages: [], journalEntries: [] };
  }
}

export function updateContextWithMessage(
  context: ConversationContext,
  message: { content: string; isUser: boolean; timestamp: Date }
): ConversationContext {
  return {
    ...context,
    recentMessages: [
      ...context.recentMessages,
      message
    ].slice(-5) // Keep last 5 messages for context
  };
}