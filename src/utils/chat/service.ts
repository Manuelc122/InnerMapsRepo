import { type ChatResponse, type ConversationContext } from './types';
import { createTherapeuticPrompt } from './prompts/therapeutic';
import { generateChatResponse as generateOpenAIResponse } from './services/openai';
import { containsCrisisKeywords } from './utils/safety';
import { CRISIS_SUPPORT } from './constants';

const DEFAULT_RESPONSE: ChatResponse = {
  content: "I'm here to support your journey of self-discovery. What would you like to explore today?",
  role: 'assistant'
};

export async function generateChatResponse(
  message: string,
  context?: ConversationContext
): Promise<ChatResponse> {
  try {
    if (containsCrisisKeywords(message)) {
      return {
        content: CRISIS_SUPPORT.resources,
        role: 'assistant'
      };
    }

    const prompt = context 
      ? createTherapeuticPrompt(message, context)
      : message;
      
    return await generateOpenAIResponse(prompt);
  } catch (error) {
    console.error('Error generating chat response:', error);
    return DEFAULT_RESPONSE;
  }
}