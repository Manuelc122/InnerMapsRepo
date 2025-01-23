import { getGeminiResponse } from '../../gemini/service';
import { sanitizeJson } from './jsonSanitizer';
import { validateChatResponse } from './validation';
import type { ChatResponse } from '../types';

export async function processGeminiResponse(prompt: string): Promise<ChatResponse | null> {
  try {
    const response = await getGeminiResponse(prompt);
    if (!response?.chatResponse) return null;

    const sanitizedResponse = sanitizeJson(response.chatResponse);
    const parsedResponse = JSON.parse(sanitizedResponse);
    
    validateChatResponse(parsedResponse);

    return {
      content: parsedResponse.content,
      suggestedTopics: parsedResponse.suggestedTopics || [],
      followUpQuestions: parsedResponse.followUpQuestions || []
    };
  } catch (error) {
    console.error('Response processing error:', error);
    return null;
  }
}