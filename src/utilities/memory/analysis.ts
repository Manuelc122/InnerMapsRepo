import { Memory, MemoryCategory, MemoryInsight, PatternType } from './types';
import stringSimilarity from 'string-similarity';

// Helper functions for memory analysis
function calculateAverageConfidence(memories: Memory[]): number {
  if (!memories.length) return 0;
  return memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
}

function getLatestUpdate(memories: Memory[]): string {
  if (!memories.length) return new Date().toISOString();
  return memories.reduce((latest, m) => 
    m.last_updated > latest ? m.last_updated : latest, 
    memories[0].last_updated
  );
}

function areContextuallySimilar(m1: Memory, m2: Memory): boolean {
  if (!m1.context || !m2.context) return false;
  const similarity = stringSimilarity.compareTwoStrings(m1.context, m2.context);
  return similarity > 0.3; // Threshold for contextual similarity
}

function shareSignificantWords(m1: Memory, m2: Memory): boolean {
  const words1 = new Set(m1.fact.toLowerCase().split(/\W+/));
  const words2 = new Set(m2.fact.toLowerCase().split(/\W+/));
  const commonWords = new Set([...words1].filter(x => words2.has(x)));
  
  // Filter out common stop words
  const significantCommonWords = [...commonWords].filter(word => 
    !STOP_WORDS.has(word) && word.length > 3
  );
  
  return significantCommonWords.length >= 2;
}

function areTemporallyRelated(m1: Memory, m2: Memory): boolean {
  const date1 = new Date(m1.created_at);
  const date2 = new Date(m2.created_at);
  const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays <= 7; // Consider memories within a week related
}

// Pattern detection functions
function detectPatternType(memory: Memory, relatedMemories: Memory[]): PatternType {
  const similarMemories = relatedMemories.filter(m => 
    areContextuallySimilar(memory, m) || shareSignificantWords(memory, m)
  );

  if (similarMemories.length >= 3 && memory.confidence > 0.8) {
    return 'established';
  } else if (similarMemories.length >= 2 || memory.confidence > 0.6) {
    return 'recurring';
  }
  return 'one_time';
}

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
]);

// Main analysis functions
export async function analyzeMemoryPatterns(memories: Memory[]): Promise<MemoryInsight[]> {
  const groupedMemories = memories.reduce((acc, memory) => {
    if (!acc[memory.category]) {
      acc[memory.category] = [];
    }
    acc[memory.category].push(memory);
    return acc;
  }, {} as Record<MemoryCategory, Memory[]>);

  return Object.entries(groupedMemories).map(([category, categoryMemories]) => {
    const patterns = {
      established: categoryMemories.filter(m => detectPatternType(m, categoryMemories) === 'established'),
      recurring: categoryMemories.filter(m => detectPatternType(m, categoryMemories) === 'recurring'),
      emerging: categoryMemories.filter(m => detectPatternType(m, categoryMemories) === 'one_time'),
    };

    return {
      category: category as MemoryCategory,
      patterns,
      confidence: calculateAverageConfidence(categoryMemories),
      last_updated: getLatestUpdate(categoryMemories)
    };
  });
}

export function findRelatedMemories(memory: Memory, allMemories: Memory[]): Memory[] {
  return allMemories
    .filter(m => 
      m.id !== memory.id && 
      (
        areContextuallySimilar(m, memory) ||
        shareSignificantWords(m, memory) ||
        areTemporallyRelated(m, memory)
      )
    )
    .sort((a, b) => {
      // Sort by similarity score
      const scoreA = calculateSimilarityScore(memory, a);
      const scoreB = calculateSimilarityScore(memory, b);
      return scoreB - scoreA;
    });
}

function calculateSimilarityScore(m1: Memory, m2: Memory): number {
  let score = 0;
  
  // Context similarity (0-0.4)
  if (m1.context && m2.context) {
    score += stringSimilarity.compareTwoStrings(m1.context, m2.context) * 0.4;
  }
  
  // Word similarity (0-0.3)
  const words1 = new Set(m1.fact.toLowerCase().split(/\W+/));
  const words2 = new Set(m2.fact.toLowerCase().split(/\W+/));
  const commonWords = new Set([...words1].filter(x => words2.has(x)));
  score += (commonWords.size / Math.max(words1.size, words2.size)) * 0.3;
  
  // Category match (0-0.2)
  if (m1.category === m2.category) {
    score += 0.2;
  }
  
  // Temporal proximity (0-0.1)
  const date1 = new Date(m1.created_at);
  const date2 = new Date(m2.created_at);
  const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  if (diffInDays <= 7) {
    score += 0.1 * (1 - diffInDays/7);
  }
  
  return score;
} 