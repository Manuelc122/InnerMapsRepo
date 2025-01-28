import { CHAT_CONFIG } from '../config';
import { withRetry } from '../utils/retry';
import type { ChatResponse } from '../types';

const API_URL = 'https://api.gpt4-mini.com/v1/chat/completions';

export async function generateChatResponse(prompt: string): Promise<ChatResponse> {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_CONFIG.timeout);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHAT_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: CHAT_CONFIG.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: CHAT_CONFIG.temperature,
          max_tokens: CHAT_CONFIG.maxTokens
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from API');
      }

      try {
        const parsedResponse = JSON.parse(content);
        return {
          content: parsedResponse.content,
          suggestedTopics: parsedResponse.suggestedTopics || []
        };
      } catch (parseError) {
        // If parsing fails, return the raw content
        return {
          content,
          suggestedTopics: []
        };
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });
}