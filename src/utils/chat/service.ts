import { generateSystemPrompt, generateUserPrompt } from './prompt';
import { saveChatMessage, getChatHistory } from './db';
import { JournalEntry } from '../types';

const MAX_HISTORY_MESSAGES = 6; // Reduced history for more focused conversation

export async function getAIResponse(userMessage: string, journalEntries: JournalEntry[]) {
  try {
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generateUserPrompt(journalEntries, userMessage);

    // Get recent chat history
    const chatHistory = await getChatHistory();
    const recentMessages = chatHistory
      .slice(-MAX_HISTORY_MESSAGES)
      .map(msg => ({
        role: msg.is_user ? "user" : "assistant",
        content: msg.message
      }));

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages,
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,     // Keep responses complete
        temperature: 0.9,     // Higher temperature for more natural language
        presence_penalty: 0.8, // Higher penalty to avoid repetitive patterns
        frequency_penalty: 0.8,// Higher penalty to encourage varied language
        top_p: 0.95          // Allow more creative responses
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) throw new Error('No response from AI');

    // Save both messages to chat history
    await saveChatMessage(userMessage, true);
    await saveChatMessage(aiResponse, false);

    return aiResponse;
  } catch (error) {
    console.error('Error getting AI response:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('The response took too long. Please try again.');
    }
    throw error;
  }
}