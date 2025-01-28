import { type ConversationContext } from '../types';
import { THERAPEUTIC_PROMPT, CRISIS_DISCLAIMER } from './therapeutic';

function formatContext(context: ConversationContext): string {
  const parts: string[] = [];

  // Add journal insights
  if (context.userProfile) {
    parts.push('Clinical Context:');
    if (context.userProfile.emotionalPatterns) {
      parts.push(`Observed Patterns: ${context.userProfile.emotionalPatterns}`);
    }
    if (context.userProfile.currentFocus) {
      parts.push(`Treatment Focus: ${context.userProfile.currentFocus}`);
    }
    if (context.userProfile.growthAreas) {
      parts.push(`Development Areas: ${context.userProfile.growthAreas}`);
    }
  }

  // Add recent journal entries
  if (context.journalEntries.length > 0) {
    parts.push('\nRecent Journal Entries (for clinical context):');
    context.journalEntries.forEach(entry => {
      parts.push(`[${entry.timestamp.toISOString()}]\n${entry.content}`);
    });
  }

  // Add conversation history
  if (context.recentMessages.length > 0) {
    parts.push('\nSession History:');
    context.recentMessages.forEach(msg => {
      parts.push(`[${msg.isUser ? 'Client' : 'Therapist'}] ${msg.content}`);
    });
  }

  return parts.join('\n\n');
}

export function createChatPrompt(
  message: string,
  context: ConversationContext
): string {
  // Check for potential crisis keywords
  const crisisKeywords = ['suicide', 'kill', 'die', 'end it', 'harm'];
  const containsCrisisKeywords = crisisKeywords.some(
    keyword => message.toLowerCase().includes(keyword)
  );

  return `${THERAPEUTIC_PROMPT}

${formatContext(context)}

Current Statement: ${message}

${containsCrisisKeywords ? `\n${CRISIS_DISCLAIMER}\n` : ''}

Respond as a clinical psychologist using 3rd wave CBT principles. Maintain professional therapeutic dialogue while providing evidence-based insights and interventions.`;
}