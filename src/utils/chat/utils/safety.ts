import { CRISIS_SUPPORT } from '../constants';

export function containsCrisisKeywords(message: string): boolean {
  const normalizedMessage = message.toLowerCase();
  return CRISIS_SUPPORT.keywords.some(keyword => 
    normalizedMessage.includes(keyword.toLowerCase())
  );
}