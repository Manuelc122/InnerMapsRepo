import { CHAT_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import type { ChatResponse } from '../types';

export async function generateChatResponse(prompt: string): Promise<ChatResponse> {
  if (!CHAT_CONFIG.apiKey) {
    throw new Error('OpenAI API key is missing');
  }

  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_CONFIG.timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHAT_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: CHAT_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'You are a supportive friend having a natural conversation. Be warm, genuine, and understanding. Format your response as JSON with "content" and "suggestedTopics" fields.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9,
          max_tokens: CHAT_CONFIG.maxTokens
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from API');
      }

      try {
        // Try to parse as JSON first
        const parsedResponse = JSON.parse(content);
        return {
          content: parsedResponse.content,
          role: 'assistant',
          suggestedTopics: parsedResponse.suggestedTopics || []
        };
      } catch (parseError) {
        // If parsing fails, use the raw content
        return {
          content,
          role: 'assistant',
          suggestedTopics: []
        };
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });
}