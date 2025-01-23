import { MemoryExtraction, ExtractionResponse } from './types';
import { createMemoryExtractionPrompt } from './extraction-prompt';

export async function extractMemories(content: string): Promise<MemoryExtraction[]> {
  try {
    console.log('Starting memory extraction for content:', content.substring(0, 100) + '...');
    
    if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
      throw new Error('VITE_DEEPSEEK_API_KEY is not configured');
    }

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
            role: "system",
            content: "You are an AI trained to extract memories and insights from journal entries. Focus on concrete, factual information."
          },
          {
            role: "user",
            content: createMemoryExtractionPrompt(content)
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw API Response:', data);

    let extractedData: ExtractionResponse;
    try {
      const content = data.choices[0].message.content;
      console.log('Content to parse:', content);
      extractedData = JSON.parse(content);
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error('Failed to parse memory extraction response');
    }

    if (!extractedData.memories || !Array.isArray(extractedData.memories)) {
      console.error('Invalid response format:', extractedData);
      throw new Error('Invalid memories format in response');
    }

    // Validate each memory
    const validMemories = extractedData.memories.filter(memory => {
      const isValid = 
        typeof memory.fact === 'string' && 
        memory.fact.length > 0 &&
        typeof memory.category === 'string' &&
        typeof memory.confidence === 'number' &&
        memory.confidence >= 0 &&
        memory.confidence <= 1;

      if (!isValid) {
        console.warn('Invalid memory:', memory);
      }
      return isValid;
    });

    console.log('Extracted valid memories:', validMemories);
    return validMemories;
  } catch (error) {
    console.error('Error in extractMemories:', error);
    throw error;
  }
} 