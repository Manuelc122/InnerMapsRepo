import type { ChatConfig } from './index';

export function validateConfig(config: ChatConfig): void {
  if (!config.apiKey) {
    throw new Error('Missing OpenAI API key. Please add VITE_OPENAI_API_KEY to your .env file');
  }

  if (!config.model) {
    throw new Error('Missing model configuration');
  }

  // Validate numeric parameters
  if (config.maxRetries < 0) {
    throw new Error('maxRetries must be non-negative');
  }

  if (config.retryDelay < 0) {
    throw new Error('retryDelay must be non-negative');
  }

  if (config.timeout < 1000) {
    throw new Error('timeout must be at least 1000ms');
  }

  if (config.maxTokens < 1) {
    throw new Error('maxTokens must be positive');
  }

  if (config.temperature < 0 || config.temperature > 1) {
    throw new Error('temperature must be between 0 and 1');
  }
}