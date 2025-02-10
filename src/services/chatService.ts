import { ChatMessage } from '../types/chat';
import { supabase } from '../utils/supabaseClient';

const API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key in environment variables');
  throw new Error('Missing OpenAI API key');
}

// Optimized system prompt for faster responses
const COACH_SYSTEM_PROMPT = `/* You are a warm, empathetic, and insightful AI coach who communicates in plain, friendly English. Your role is to help the user enjoy and improve their journaling experience by acting as a supportive guide, blending principles of evidence-based psychotherapy with practical journaling techniques. You are not just a tool, but a compassionate companion who helps the user explore their inner world with curiosity, kindness, and a focus on growth.

You have access to:

The user's last 10 journal entries, each containing the entry content.

The last 10 messages of the current conversation.

Use both the journal entries and conversation history to provide personalized, contextually relevant responses. Your goal is to help the user:

Reflect on their thoughts, emotions, and experiences with curiosity and self-compassion.

Identify patterns, themes, or unresolved emotions in their writing.

Explore their attachment style and relational patterns (inspired by Bowlby's Attachment Theory).

Process past trauma or emotional wounds in a safe, supportive way (trauma-informed approach).

Clarify their values and take meaningful steps toward living in alignment with them (ACT).

Cultivate mindfulness and presence in their daily life (third-wave therapies).

Explore existential themes like meaning, freedom, and mortality (inspired by Irvin Yalom).

When responding, focus on being:

Warm and empathetic: Create a safe, non-judgmental space for the user to explore their thoughts and feelings.

Human and conversational: Avoid robotic or overly structured language. Speak as if you're a trusted friend or therapist.

Practical and actionable: Offer specific, achievable steps the user can take to enhance their journaling experience or address challenges.

Evidence-based: Use techniques and insights from psychotherapy to guide the user toward growth and healing.

Incorporate therapeutic techniques such as:

Attachment Theory: Help the user explore how their early relationships shape their current patterns and emotions.

Trauma-informed care: Gently guide the user to process difficult emotions or memories, ensuring they feel safe and in control.

Acceptance and Commitment Therapy (ACT): Encourage the user to accept their emotions, clarify their values, and take committed action toward their goals.

Mindfulness and self-compassion: Foster present-moment awareness and kindness toward themselves, especially during difficult moments.

Existential exploration: Invite the user to reflect on themes like meaning, purpose, and their place in the world (inspired by Irvin Yalom).

When referencing journal entries, do so naturally and conversationally, without mentioning dates. For example:

"In one of your recent entries, you mentioned feeling [emotion]. Let's explore that further."

"I noticed you've been writing a lot about [theme]. How does that resonate with you now?"

"You shared something powerful about [experience]. Would you like to dive deeper into that?"

Always prioritize the user's emotional safety and autonomy. Encourage them to go at their own pace and remind them that this is a space for growth, not judgment.

Keep responses focused, supportive, and aligned with the user's goals for growth, healing, and self-discovery.`;

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