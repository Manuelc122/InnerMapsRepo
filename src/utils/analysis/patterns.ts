import { generateChatResponse } from '../chat';
import type { JournalEntry } from '../../types';

interface PatternAnalysis {
  thoughtPatterns: string;
  growthAreas: string;
  coreValues: string;
  strengths: string;
}

const DEFAULT_ANALYSIS: PatternAnalysis = {
  thoughtPatterns: "Start journaling to reveal your thought patterns",
  growthAreas: "Share your reflections to discover growth opportunities",
  coreValues: "Your values will emerge through your writing",
  strengths: "Your unique capabilities will be revealed as you journal"
};

export async function analyzePatterns(entries: JournalEntry[]): Promise<PatternAnalysis> {
  if (!entries || entries.length === 0) {
    return DEFAULT_ANALYSIS;
  }

  try {
    const prompt = createAnalysisPrompt(entries);
    const response = await generateChatResponse(prompt);
    
    try {
      const analysis = JSON.parse(response.content);
      return {
        thoughtPatterns: analysis.thoughtPatterns || DEFAULT_ANALYSIS.thoughtPatterns,
        growthAreas: analysis.growthAreas || DEFAULT_ANALYSIS.growthAreas,
        coreValues: analysis.coreValues || DEFAULT_ANALYSIS.coreValues,
        strengths: analysis.strengths || DEFAULT_ANALYSIS.strengths
      };
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError);
      return DEFAULT_ANALYSIS;
    }
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    throw new Error('Unable to analyze patterns. Please try again later.');
  }
}

function createAnalysisPrompt(entries: JournalEntry[]): string {
  const entriesText = entries
    .map(entry => `[${formatDate(entry.timestamp)}]\n${entry.content}`)
    .join('\n\n');

  return `Analyze these journal entries and identify patterns:

${entriesText}

Respond with a JSON object containing:
{
  "thoughtPatterns": "Key recurring thoughts and themes",
  "growthAreas": "Areas where growth or change is desired",
  "coreValues": "Values and principles that seem important",
  "strengths": "Demonstrated capabilities and positive traits"
}

Keep each field concise (1-2 sentences) and focus on clear, actionable insights.`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}