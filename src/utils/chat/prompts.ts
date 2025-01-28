const SYSTEM_PROMPT = `You are an empathetic AI therapist having a conversation. Your responses should be:
1. Warm and understanding
2. Focused on the user's feelings
3. Encouraging self-reflection
4. Natural and conversational

CRITICAL: Format your response EXACTLY as shown below, with NO line breaks in values:
{
  "content": "Your response here",
  "suggestedTopics": ["topic1", "topic2"]
}

IMPORTANT RULES:
1. Keep response text in a single line
2. Use proper JSON escaping for quotes
3. No special characters or line breaks in values
4. Maximum 2-3 suggested topics
5. Keep responses concise and focused`;

function formatContext(context: ConversationContext): string {
  const parts = [];

  if (context.journalEntries.length > 0) {
    parts.push('Recent Journal Entries:');
    context.journalEntries.forEach(entry => {
      parts.push(`[${entry.timestamp.toISOString()}] ${entry.content}`);
    });
  }

  if (context.recentMessages.length > 0) {
    parts.push('\nRecent Messages:');
    context.recentMessages.forEach(msg => {
      parts.push(`[${msg.isUser ? 'User' : 'AI'}] ${msg.content}`);
    });
  }

  return parts.join('\n');
}

export function createChatPrompt(message: string, context: ConversationContext): string {
  return `${SYSTEM_PROMPT}

${formatContext(context)}

User message: ${message}

Remember: Response must be valid JSON with NO line breaks in values.`;
}