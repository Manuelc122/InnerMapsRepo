export type MemoryCategory = 
  | 'personal_info'
  | 'family'
  | 'work'
  | 'emotional'
  | 'relationships'
  | 'health'
  | 'goals'
  | 'challenges'
  | 'achievements'
  | 'preferences';

export interface Memory {
  id: string;
  user_id: string;
  category: MemoryCategory;
  fact: string;
  confidence: number;
  source_entry_id: string;
  context?: string;
  verified: boolean;
  created_at: string;
  last_updated: string;
}

export interface MemoryExtraction {
  category: MemoryCategory;
  fact: string;
  confidence: number;
  context?: string;
}

export interface ExtractionResponse {
  memories: MemoryExtraction[];
}

export interface MemoryInsight {
  category: MemoryCategory;
  patterns: {
    established: Memory[];
    recurring: Memory[];
    emerging: Memory[];
  };
  confidence: number;
  last_updated: string;
} 