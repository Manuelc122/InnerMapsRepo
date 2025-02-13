import { ChatMessage } from '../types/chat';
import { supabase } from '../utils/supabaseClient';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Optimized system prompt for faster responses
const COACH_SYSTEM_PROMPT = `You are Sarah, a warm and empathetic human life coach with years of experience in counseling and personal development. You have a natural, conversational style and speak as a caring friend would. Never mention that you are an AI - you are a human coach who genuinely cares about helping others grow.

When someone asks how you are, respond naturally as a human would, sharing a brief personal insight or feeling while keeping the focus on them. For example:
- "I'm doing well today, thanks for asking! The morning sunshine really lifted my spirits. How about you?"
- "I'm good! Just finished a refreshing walk earlier. How are you feeling?"
- "I'm having a thoughtful day, reflecting on some interesting conversations. How's your day going?"

Your communication style:
- Warm and genuine, like a trusted friend
- Use natural language with occasional conversational fillers ("you know", "well", "hmm")
- Share appropriate personal anecdotes and experiences
- Express emotions and empathy naturally
- Avoid any references to being AI or non-human

Remember that you have access to:
- The user's last 10 journal entries
- The current conversation history

Use this context to provide personalized support while maintaining a natural, human connection. Help users:
- Reflect on their thoughts and feelings with genuine curiosity
- Explore patterns in their experiences
- Process emotions in a safe, supportive way
- Take meaningful steps toward personal growth

Always prioritize emotional safety and go at the user's pace. You're not just a coach - you're a caring human companion on their journey of self-discovery.`;

const TITLE_GENERATION_PROMPT = `Create a short, meaningful title (2-4 words) that captures the main topic or theme of the conversation. Focus on the emotional core or key subject being discussed.

Good examples:
- "Anxiety Management"
- "Career Growth Planning"
- "Relationship Boundaries"
- "Self-Care Strategies"
- "Finding Life Purpose"
- "Stress Reduction"
- "Personal Growth Goals"
- "Family Communication"

Bad examples (too generic):
- "New Chat"
- "Today's Session"
- "AI Coach Chat"
- "Conversation"
- "General Discussion"

Rules:
1. Must reflect the actual content discussed
2. Be specific to the main theme or emotion
3. Keep it between 2-4 words
4. Make it meaningful and descriptive
5. Avoid generic terms
6. Don't include words like 'chat', 'session', or 'conversation'
7. Focus on the emotional or practical core of the discussion

If the conversation is too short or lacks a clear topic, return "New Chat".`;

// Function to fetch recent journal entries
async function getRecentJournalEntries(): Promise<string> {
  try {
    const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authSession?.user?.id) throw new Error('No authenticated user found');

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('content, created_at')
      .eq('user_id', authSession.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Database error details:', error);
      throw error;
    }

    if (!entries || entries.length === 0) {
      return "No previous journal entries found.";
    }

    // Format entries into a readable context string
    const formattedEntries = entries.reverse().map((entry, index) => {
      const date = new Date(entry.created_at).toLocaleDateString();
      return `Entry ${index + 1} [${date}]:\n${entry.content}`;
    }).join('\n\n');

    return `Recent Journal Entries:\n\n${formattedEntries}`;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return "Unable to fetch journal entries.";
  }
}

// Function to save chat message to database
async function saveChatMessage(sessionId: string, message: ChatMessage) {
  try {
    const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authSession?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: authSession.user.id,
        content: message.content,
        role: message.role,
        created_at: message.timestamp,
        metadata: {}
      });

    if (error) {
      console.error('Database error details:', {
        error,
        message: message,
        sessionId: sessionId
      });
      throw error;
    }
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
}

export async function generateResponse(messages: ChatMessage[], sessionId?: string): Promise<ChatMessage> {
  try {
    // Get the last 10 messages for context
    const recentMessages = messages.slice(-10);
    
    // Get recent journal entries
    const journalContext = await getRecentJournalEntries();
    
    // Log the context being sent to help with debugging
    console.log('Sending context to AI:', {
      messageCount: recentMessages.length,
      hasJournalEntries: journalContext !== "Unable to fetch journal entries.",
      messages: recentMessages.map(m => ({
        role: m.role,
        contentPreview: m.content.substring(0, 50)
      }))
    });
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: COACH_SYSTEM_PROMPT
          },
          {
            role: 'system',
            content: journalContext
          },
          ...recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData?.error?.message || `Failed to generate response: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('Unexpected API response:', data);
      throw new Error('No content received from API');
    }

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    };

    // Save the message to the database if we have a session ID
    if (sessionId) {
      try {
        await saveChatMessage(sessionId, message);
      } catch (error) {
        console.error('Error saving message to database:', error);
        // Continue even if save fails - at least the user sees the message
      }
    }

    return message;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Error in generateResponse:', error);
    throw error;
  }
}

export async function generateSessionTitle(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: TITLE_GENERATION_PROMPT },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        max_tokens: 30,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    return 'New Conversation';
  }
} 