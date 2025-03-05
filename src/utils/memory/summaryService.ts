/**
 * Service for generating summaries for memories using OpenAI API
 */

/**
 * Generates a concise summary for a memory content
 * @param content The memory content to summarize
 * @param userName Optional user's first name to personalize the summary
 * @returns A concise summary of the memory content
 */
export async function generateMemorySummary(content: string, userName?: string): Promise<string | null> {
  try {
    console.log('Generating summary for content:', content.substring(0, 50) + '...');
    // Removed console.log with sensitive information
    
    // Create a personalized system prompt if userName is provided
    let systemPrompt = 'You are a helpful assistant that creates concise, meaningful summaries of journal entries and chat messages. Create a summary that captures the key emotions, events, and insights in 1-2 sentences.';
    
    if (userName) {
      console.log(`Personalizing summary for user: ${userName}`);
      systemPrompt = `You are a helpful assistant that creates concise, meaningful summaries of journal entries and chat messages. Create a summary that captures the key emotions, events, and insights in 1-2 sentences. Refer to the author by their first name "${userName}" instead of using generic terms like "the writer", "the author", or "the user". Make it feel personal by using their first name.`;
    } else {
      console.log('No user name provided, using generic summary format');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please summarize the following text in 1-2 sentences, focusing on the key emotions, events, and insights:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim() || null;
    console.log('Generated summary:', summary);
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

/**
 * Batch generates summaries for multiple memories
 * @param memories Array of memory objects with id and content
 * @param userName Optional user's first name to personalize the summaries
 * @returns Array of objects with id and generated summary
 */
export async function batchGenerateMemorySummaries(
  memories: { id: string, content: string }[],
  userName?: string
): Promise<{ id: string, summary: string | null }[]> {
  const results = [];
  
  if (userName) {
    console.log(`Batch generating personalized summaries for ${memories.length} memories for user: ${userName}`);
  } else {
    console.log(`Batch generating generic summaries for ${memories.length} memories`);
  }
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < memories.length; i += batchSize) {
    const batch = memories.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(memories.length/batchSize)}`);
    
    const batchPromises = batch.map(async (memory) => {
      const summary = await generateMemorySummary(memory.content, userName);
      return { id: memory.id, summary };
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < memories.length) {
      const delayMs = 1000;
      console.log(`Waiting ${delayMs}ms before processing next batch...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
} 