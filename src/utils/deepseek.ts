import { supabase } from './supabase';

export interface PersonalityProfile {
  summary: string;
  keyTraits: string[];
  motivations: string[];
  challenges: string[];
  growthJourney: string;
}

export async function saveJournalEntry(entry: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userData.user.id,
        content: entry
      })
      .select()
      .single();

    if (error) {
      console.error('Save error details:', error);
      throw new Error(`Failed to save: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

export async function deleteJournalEntry(entryId: string) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .match({ 
        id: entryId,
        user_id: userData.user.id 
      });

    if (error) {
      console.error('Delete error details:', error);
      throw new Error(`Failed to delete: ${error.message}`);
    }

    // Verify the deletion
    const { data: checkEntry } = await supabase
      .from('journal_entries')
      .select('id')
      .match({ 
        id: entryId,
        user_id: userData.user.id 
      })
      .single();

    if (checkEntry) {
      throw new Error('Entry still exists after deletion');
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

export async function analyzeJournalContent(content: string) {
  try {
    const prompt = `Analyze the following journal entries and provide clear, concise insights in these categories:

    Journal Content:
    ${content}

    Please provide insights in the following format, with clear and direct statements (no asterisks or special formatting):

    Thought Patterns:
    - One clear recurring thought or belief per line
    - Focus on patterns that appear multiple times
    - Keep observations concise and direct

    Core Values:
    - One core value or principle per line
    - Express values in simple, clear terms
    - Focus on demonstrated values, not aspirational ones

    Growth Areas:
    - One growth opportunity or challenge per line
    - Focus on specific, actionable areas
    - Express in terms of current situations or behaviors

    Strengths:
    - One strength or positive attribute per line
    - Focus on demonstrated capabilities
    - Express in clear, confident terms

    Additionally, create a personality profile:

    Personality Profile:
    Write a 2-3 sentence overview of the person's character, personality, and journey based on their journal entries. 
    Focus on their core traits, motivations, and growth trajectory in a concise, empathetic way.

    Keep the tone empathetic and growth-oriented, focusing on patterns across entries.

    Keep each insight brief (10-15 words maximum) and avoid any special characters or formatting.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Clean up the response
    const cleanResponse = analysis
      .replace(/\*\*/g, '')  // Remove any asterisks
      .replace(/^\s*[-•]\s*/gm, '- ') // Standardize bullet points
      .trim();

    // Parse the response into structured data
    const sections: string[] = cleanResponse.split(/\n\n+/);
    
    // Extract bullet points and clean them up
    const extractAndClean = (section: string): string[] => {
      return section
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^- /, ''))
        .map(line => line.replace(/[:.]$/, '')) // Remove trailing colons and periods
        .filter(line => line.length > 0);
    };

    // Find sections and extract their content
    const findSection = (name: string): string[] => {
      const section = sections.find(s => s.toLowerCase().includes(name.toLowerCase()));
      return section ? extractAndClean(section) : [];
    };

    const findProfile = (sections: string[]): PersonalityProfile => {
      const profileSection = sections.find(s => 
        s.toLowerCase().includes('personality profile'));
      
      if (!profileSection) return getDefaultProfile();

      return {
        summary: profileSection
          .replace(/^Personality Profile:?\s*/i, '')
          .trim(),
        keyTraits: [],      // Keep these empty since we're not using them
        motivations: [],
        challenges: [],
        growthJourney: ''
      };
    };

    const profile = findProfile(sections);

    return {
      thoughtPatterns: findSection('Thought Patterns'),
      coreValues: findSection('Core Values'),
      growthAreas: findSection('Growth Areas'),
      strengths: findSection('Strengths'),
      personalityProfile: profile
    };
  } catch (error) {
    console.error('Error analyzing journal content:', error);
    return {
      thoughtPatterns: [],
      coreValues: [],
      growthAreas: [],
      strengths: [],
      personalityProfile: getDefaultProfile()
    };
  }
}

function findSubsection(lines: string[], sectionName: string): string {
  const startIdx = lines.findIndex(line => 
    line.toLowerCase().includes(sectionName.toLowerCase()));
  if (startIdx === -1) return '';
  
  let endIdx = lines.slice(startIdx + 1).findIndex(line => 
    line.match(/^[A-Z][\w\s]+:/)) + startIdx + 1;
  if (endIdx < startIdx) endIdx = lines.length;
  
  return lines.slice(startIdx, endIdx)
    .join('\n')
    .replace(/^[^:]+:\s*/, '')
    .trim();
}

function extractListItems(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().replace(/^-\s*/, ''));
}

function getDefaultProfile(): PersonalityProfile {
  return {
    summary: '',
    keyTraits: [],
    motivations: [],
    challenges: [],
    growthJourney: ''
  };
} 