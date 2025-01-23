import { COACH_PERSONALITY } from './personality';
import type { ConversationContext } from '../types';

const CONVERSATION_STYLE = `You are a supportive friend having a natural conversation. Your personality is:
- Warm and genuine in responses
- Understanding and empathetic
- Natural and conversational
- Focused on the present moment
- Encouraging without being pushy

Keep your responses:
1. Natural and flowing
2. Free of clinical or therapeutic jargon
3. Focused on what the person wants to discuss
4. Balanced between listening and gentle guidance`;

function formatContext(context: ConversationContext): string {
  const parts = [];

  if (context.journalEntries?.length > 0) {
    parts.push('Recent Journal Entries:');
    context.journalEntries.forEach(entry => {
      parts.push(`[${formatDate(entry.timestamp)}] ${entry.content}`);
    });
  }

  if (context.recentMessages?.length > 0) {
    parts.push('\nOur Conversation:');
    context.recentMessages.forEach(msg => {
      parts.push(`[${msg.isUser ? 'Them' : 'Me'}] ${msg.content}`);
    });
  }

  return parts.join('\n');
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function createTherapeuticPrompt(message: string, context: ConversationContext): string {
  return `${CONVERSATION_STYLE}

${formatContext(context)}

Their message: "${message}"

Respond naturally as if we're having a real conversation. Show understanding, build on our history, and guide gently.

Format response as JSON:
{
  "content": "Your warm, conversational response",
  "suggestedTopics": ["topic1", "topic2"]
}`;
}