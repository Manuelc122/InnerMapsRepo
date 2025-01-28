export function createMemoryExtractionPrompt(journalEntry: string): string {
  return `
Extract key memories and insights from this journal entry. Focus on factual information and clear patterns.

Guidelines:
- Extract specific, concrete facts and observations
- Focus on personal information, relationships, habits, preferences
- Include relevant context from the entry
- Assign confidence levels based on clarity and certainty of the information
- Keep facts concise and specific
- Extract at least 3-5 memories per entry

Categories:
- personal_info: Basic facts about the person (traits, background, identity)
- family: Family relationships, dynamics, and events
- work: Career, professional life, work experiences
- emotional: Feelings, emotional patterns, and reactions
- relationships: Social connections, friendships, interactions
- health: Physical and mental wellbeing, habits
- goals: Aspirations, objectives, plans
- challenges: Difficulties, obstacles, concerns
- achievements: Accomplishments, progress, successes
- preferences: Likes, dislikes, preferences, interests

Format each memory as:
{
  "category": "one_of_the_categories_above",
  "fact": "clear, specific observation (10-20 words)",
  "confidence": 0.0-1.0,
  "context": "relevant quote or context from the entry"
}

Return the response as a JSON object:
{
  "memories": [
    {memory1},
    {memory2},
    ...
  ]
}

Journal Entry:
${journalEntry}`;
} 