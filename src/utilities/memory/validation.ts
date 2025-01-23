import type { Memory, MemoryExtraction } from './types';

export function validateMemory(memory: MemoryExtraction): boolean {
  return (
    isValidCategory(memory.category) &&
    isValidConfidence(memory.confidence) &&
    isValidContent(memory.fact) &&
    (!memory.context || isValidContent(memory.context))
  );
}

function isValidCategory(category: string): boolean {
  const validCategories = [
    'personal_info', 'family', 'work', 'emotional',
    'relationships', 'health', 'goals', 'challenges',
    'achievements', 'preferences'
  ];
  return validCategories.includes(category);
}

function isValidConfidence(confidence: number): boolean {
  return typeof confidence === 'number' && 
         confidence >= 0 && 
         confidence <= 1;
}

function isValidContent(content: string): boolean {
  return typeof content === 'string' && 
         content.trim().length >= 3 &&
         content.trim().length <= 1000;
} 