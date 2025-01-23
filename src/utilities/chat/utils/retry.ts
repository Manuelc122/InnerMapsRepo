import { CHAT_CONFIG } from '../config';

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = CHAT_CONFIG.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0 || !isRetryableError(error)) {
      throw error;
    }

    const delay = CHAT_CONFIG.retryDelay * Math.pow(2, CHAT_CONFIG.maxRetries - retries);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(operation, retries - 1);
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('rate limit') ||
      error.message.includes('429') ||
      error.message.includes('500') ||
      error.message.includes('503')
    );
  }
  return false;
}