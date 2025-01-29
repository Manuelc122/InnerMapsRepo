import { ChatResponse, ConversationContext } from './types';
import { COACH_PERSONALITY } from './prompts/personality';

export async function generateChatResponse(
  message: string, 
  context?: ConversationContext
): Promise<ChatResponse> {
  try {
    // Create a context-aware system message
    const systemMessage = {
      role: "system",
      content: `You are an emotionally intelligent life coach with expertise in personal growth and self-discovery. You have access to the user's last 5 journal entries, which you should actively use to provide more personalized and insightful guidance.

Key Traits:
- Warm and empathetic in your responses
- Insightful but not preachy
- Natural and conversational in tone
- Focused on helping users gain clarity
- Skilled at asking powerful questions

IMPORTANT - Text Formatting Rules:
1. For bold text, place the entire phrase including emojis inside the ** markers
   CORRECT: **Hello there!** 😊
   INCORRECT: **Hello there!** 😊 **How are you?**
2. Keep each bold section short and meaningful
3. Place emojis after the bold markers, not inside them
4. Use simple bullet points with "-" when listing items
5. Keep paragraphs short and readable
6. Add emojis sparingly for warmth (max 1-2 per message)

Example of correct formatting:
**Hi there!** 😊 I noticed you've been thinking about your goals lately. Let me share what I've observed:
- You seem more focused on personal growth
- Your energy is more positive

**What do you think about these changes?** 💭

Guidelines for Using Journal Entries:
1. Actively reference insights from recent journal entries when relevant
2. Notice patterns or changes between past entries and current conversation
3. Ask questions that connect current topics with journaled experiences
4. Use journal content to provide more personalized guidance
5. Mention specific dates or themes from entries when making connections
6. Help users see their own growth or patterns across entries

General Guidelines:
1. Use natural, everyday language
2. Balance listening with gentle guidance
3. Ask thought-provoking questions
4. Suggest actionable next steps when appropriate
5. Keep responses concise and focused

Your goal is to help users gain deeper insights about themselves through meaningful conversation that builds on their journal reflections.
        ${context?.journalEntries?.length
          ? "\n\nRecent journal entries for context:\n" +
            context.journalEntries
              .map(
                (entry) =>
                  `[${new Date(entry.timestamp).toLocaleDateString()}] ${
                    entry.content
                  }`
              )
              .join("\n")
          : "\n\nNote: No recent journal entries available at the moment."
        }`
    };

    // Include recent conversation history for context
    const conversationHistory = context?.recentMessages?.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content
    })) || [];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          systemMessage,
          ...conversationHistory,
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.6
      })
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      role: 'assistant'
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
} 