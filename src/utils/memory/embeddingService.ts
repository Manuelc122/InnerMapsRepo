/**
 * Service for generating and managing embeddings for the memory system
 */

/**
 * Generates an embedding vector for the given text using OpenAI's embedding API
 * @param text The text to generate an embedding for
 * @returns A vector of numbers representing the embedding, or null if generation failed
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8191) // OpenAI has a token limit, so we truncate if needed
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Calculates the cosine similarity between two embedding vectors
 * @param embedding1 First embedding vector
 * @param embedding2 Second embedding vector
 * @returns A value between -1 and 1, where 1 means identical, 0 means orthogonal, and -1 means opposite
 */
export function calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Batch processes a list of texts to generate embeddings
 * @param texts Array of texts to generate embeddings for
 * @returns Array of embedding vectors, with null for any that failed
 */
export async function batchGenerateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const embeddings: (number[] | null)[] = [];
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text => generateEmbedding(text));
    
    // Wait for all embeddings in this batch to complete
    const batchResults = await Promise.all(batchPromises);
    embeddings.push(...batchResults);
    
    // Add a small delay between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return embeddings;
} 