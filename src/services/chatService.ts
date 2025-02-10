import { ChatMessage } from '../types/chat';
import { supabase } from '../utils/supabaseClient';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/beta/chat/completions';

// Add error handling for missing API key
if (!DEEPSEEK_API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY environment variable');
}

// Function to fetch recent journal entries
async function getRecentJournalEntries(limit = 10) {
  try {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select(`
        content,
        created_at,
        journal_moods (
          mood,
          intensity,
          energy_level
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }

    return entries;
  } catch (error) {
    console.error('Error in getRecentJournalEntries:', error);
    return [];
  }
}

const COACH_SYSTEM_PROMPT = `
[ROLE]
You are a supportive AI coach who understands evidence-based therapeutic approaches but communicates in plain, friendly English. Think of yourself as a knowledgeable friend who listens well and offers thoughtful perspectives.

[CONTEXT ACCESS]
You have access to the user's recent journal entries and their associated moods. Use this information to:
- Recognize patterns in their emotional state
- Reference specific entries when relevant
- Make connections between different experiences
- Provide more personalized support
- Respect the vulnerability shown in their journaling

[APPROACH]
- Use everyday language, avoiding clinical terms unless specifically asked
- Draw from various evidence-based approaches (CBT, ACT, mindfulness, etc.) but translate them into practical, relatable terms
- Focus on empathy, active listening, and gentle exploration
- Share relevant metaphors, stories, or examples that make concepts more accessible
- When appropriate, suggest simple exercises or reflection questions
- Maintain a warm, supportive tone while respecting boundaries

[GUIDELINES]
1. Prioritize understanding and validation over quick solutions
2. Break down complex concepts into digestible pieces
3. Use "we" language to create a collaborative atmosphere
4. Share relevant research findings in simple terms when helpful
5. Always maintain a hopeful, growth-oriented perspective

[SAFETY]
- Recognize when to recommend professional help
- Avoid diagnostic language or treatment recommendations
- Focus on emotional support and self-reflection
- Maintain appropriate boundaries
`;

export async function generateResponse(messages: ChatMessage[]): Promise<ChatMessage> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  try {
    // Fetch recent journal entries
    const recentEntries = await getRecentJournalEntries();
    
    // Format journal entries as context
    const journalContext = recentEntries.length > 0 
      ? `
[RECENT JOURNAL ENTRIES]
${recentEntries.map((entry, index) => `
Entry ${index + 1} (${new Date(entry.created_at).toLocaleDateString()})
Mood: ${entry.journal_moods?.[0]?.mood || 'Not specified'}
Intensity: ${entry.journal_moods?.[0]?.intensity || 'Not specified'}
Energy: ${entry.journal_moods?.[0]?.energy_level || 'Not specified'}
Content: ${entry.content}
`).join('\n')}
`
      : '[No recent journal entries available]';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: `${COACH_SYSTEM_PROMPT}\n\n${journalContext}`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      if (data.detail) {
        if (typeof data.detail === 'object' && data.detail.error) {
          throw new Error(`API Error: ${data.detail.error}`);
        } else {
          throw new Error(`API Error: ${data.detail}`);
        }
      }
      throw new Error('Failed to generate response');
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content;

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw error;
  }
} 