export interface UserProfile {
  communicationStyle: {
    openness: number;
    directness: number;
    formality: number;
  };
  valueThemes: string[];
  growthAreas: string[];
  interests: string[];
  lastUpdated: Date;
}

export interface ProfileInsight {
  theme: string;
  confidence: number;
  evidence: string[];
}