export const CHAT_CONFIG = {
  model: 'gpt-3.5-turbo',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  maxTokens: 1000,
  temperature: 0.7
} as const;

if (!CHAT_CONFIG.apiKey) {
  throw new Error('Missing OpenAI API key');
}

export type ChatConfig = typeof CHAT_CONFIG;