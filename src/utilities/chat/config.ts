export const CHAT_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: 'gpt-3.5-turbo',
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  maxTokens: 1000,
  temperature: 0.8 // Higher temperature for more natural conversation
} as const;

if (!CHAT_CONFIG.apiKey) {
  throw new Error('Missing OpenAI API key');
}

export type ChatConfig = typeof CHAT_CONFIG;