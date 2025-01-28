export function createAnalysisPrompt(
  journalEntries: string[],
  chatMessages: string[]
): string {
  return `Analyze the following user data and provide insights.

Journal Entries:
${journalEntries.join('\n')}

Chat Messages:
${chatMessages.join('\n')}

Provide analysis in the following JSON format:
{
  "emotionalPatterns": "Brief description of observed patterns",
  "growthAreas": "Key areas for development",
  "currentFocus": "Main themes and priorities",
  "strengths": "Notable capabilities and traits",
  "suggestedTopics": [
    {
      "title": "Topic title",
      "description": "Brief description",
      "importance": "Why this matters"
    }
  ]
}`;
}