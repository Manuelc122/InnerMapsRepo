import { AppError } from '../../errors';
import type { ChatResponse } from '../types';

const REQUIRED_FIELDS = ['content', 'suggestedTopics', 'followUpQuestions'];

export function validateChatResponse(response: unknown): asserts response is ChatResponse {
  if (!response || typeof response !== 'object') {
    throw new AppError('Response must be an object', 'VALIDATION_ERROR');
  }

  const typedResponse = response as Record<string, unknown>;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!(field in typedResponse)) {
      throw new AppError(`Missing required field: ${field}`, 'VALIDATION_ERROR');
    }
  }

  // Validate content
  if (typeof typedResponse.content !== 'string' || !typedResponse.content.trim()) {
    throw new AppError('Content must be a non-empty string', 'VALIDATION_ERROR');
  }

  // Validate arrays
  ['suggestedTopics', 'followUpQuestions'].forEach(field => {
    if (!Array.isArray(typedResponse[field])) {
      throw new AppError(`${field} must be an array`, 'VALIDATION_ERROR');
    }

    if (!typedResponse[field].every(item => typeof item === 'string')) {
      throw new AppError(`${field} must contain only strings`, 'VALIDATION_ERROR');
    }
  });
}