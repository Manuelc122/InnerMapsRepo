import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatSession, ChatMessage, TherapySessionState } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';
import { generateResponse, generateSessionTitle } from '../services/chatService';
import { supabase } from '../utils/supabaseClient';

const initialState: TherapySessionState = {
  sessions: [],
  activeSessionId: null,
  loading: true,
  error: null,
  pendingMessages: {},
};

// Function to save session to database
async function saveSession(session: ChatSession) {
  try {
    const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authSession?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('chat_sessions')
      .upsert({
        id: session.id,
        user_id: authSession.user.id,
        title: session.title,
        created_at: session.createdAt,
        updated_at: session.updatedAt
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

// Function to save chat message to database
async function saveChatMessage(sessionId: string, message: ChatMessage) {
  try {
    const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authSession?.user?.id) throw new Error('No authenticated user found');

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        session_id: sessionId,
        user_id: authSession.user.id,
        role: message.role,
        content: message.content,
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

export const createSession = createAsyncThunk(
  'chat/createSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!authSession?.user?.id) throw new Error('No authenticated user found');

      // Create initial session
      const session: ChatSession = {
        id: uuidv4(),
        title: 'New Chat',
        messages: [{
          id: uuidv4(),
          role: 'assistant',
          content: 'Hello! I have access to your recent journal entries and will use them to provide more personalized support. How can I help you today?',
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSession(session);
      
      // Save the initial message
      await saveChatMessage(session.id, session.messages[0]);

      return session;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create session');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    sessionId, 
    content,
    onStream 
  }: { 
    sessionId: string; 
    content: string;
    onStream?: (content: string) => void;
  }, { getState, rejectWithValue }) => {
    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!authSession?.user?.id) throw new Error('No authenticated user found');

      const state = getState() as { chat: TherapySessionState };
      const session = state.chat.sessions.find(s => s.id === sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      // Save user message to database
      await saveChatMessage(sessionId, userMessage);

      // Get AI response with streaming updates
      const aiResponse = await generateResponse([
        ...session.messages,
        userMessage
      ], sessionId);

      // Generate new title after each message exchange
      const updatedMessages = [...session.messages, userMessage, aiResponse];
      const newTitle = await generateSessionTitle(updatedMessages);
      
      // Update session title in database
      await supabase
        .from('chat_sessions')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString(),
          last_message: aiResponse.content
        })
        .eq('id', sessionId)
        .eq('user_id', authSession.user.id);

      return { 
        sessionId, 
        userMessage,
        assistantMessage: aiResponse,
        newTitle
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

// Function to load sessions from database
export const loadSessions = createAsyncThunk(
  'chat/loadSessions',
  async () => {
    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!authSession?.user?.id) throw new Error('No authenticated user found');

      // First get all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, updated_at')
        .eq('user_id', authSession.user.id)
        .order('updated_at', { ascending: false });

      if (sessionsError) {
        console.error('Error loading sessions:', sessionsError);
        throw sessionsError;
      }

      // Then get all messages for each session
      const sessionsWithMessages = await Promise.all(sessions.map(async (session) => {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('session_id', session.id)
          .eq('user_id', authSession.user.id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages for session:', session.id, messagesError);
          throw messagesError;
        }

        return {
          id: session.id,
          title: session.title,
          messages: (messages || []).map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at
          })),
          createdAt: session.created_at,
          updatedAt: session.updated_at
        };
      }));

      return sessionsWithMessages;
    } catch (error) {
      console.error('Error in loadSessions:', error);
      throw error;
    }
  }
);

// Add auto-loading of sessions when the slice is initialized
export const initializeChat = createAsyncThunk(
  'chat/initialize',
  async (_, { dispatch }) => {
    await dispatch(loadSessions());
  }
);

// Add this new thunk for deleting sessions
export const deleteSession = createAsyncThunk(
  'chat/deleteSession',
  async (sessionId: string, { getState, rejectWithValue }) => {
    try {
      const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!authSession?.user?.id) throw new Error('No authenticated user found');

      // Delete the session from Supabase
      const { error: deleteError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', authSession.user.id);

      if (deleteError) throw deleteError;

      return sessionId;
    } catch (error) {
      console.error('Error deleting session:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete session');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessions: [] as ChatSession[],
    activeSessionId: null as string | null,
    loading: true,
    error: null as string | null
  },
  reducers: {
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ sessionId: string; message: ChatMessage }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        session.messages.push(action.payload.message);
        session.updatedAt = new Date().toISOString();
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Initialize chat
    builder.addCase(initializeChat.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(initializeChat.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
    });
    builder.addCase(initializeChat.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to initialize chat';
    });

    // Load sessions
    builder.addCase(loadSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loadSessions.fulfilled, (state, action) => {
      state.sessions = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(loadSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to load sessions';
    });

    // Create session
    builder.addCase(createSession.fulfilled, (state, action) => {
      state.sessions.unshift(action.payload);
      state.activeSessionId = action.payload.id;
    });

    // Update sendMessage.fulfilled case
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        // Remove any pending messages first
        session.messages = session.messages.filter(msg => !msg.pending);
        // Add the new messages
        session.messages.push(action.payload.userMessage);
        session.messages.push(action.payload.assistantMessage);
        session.title = action.payload.newTitle;
        session.updatedAt = new Date().toISOString();
      }
    });

    // Add the delete session cases
    builder.addCase(deleteSession.fulfilled, (state, action) => {
      state.sessions = state.sessions.filter(session => session.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions[0]?.id || null;
      }
    });
    builder.addCase(deleteSession.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to delete session';
    });
  }
});

export const { setActiveSession, addMessage, clearError } = chatSlice.actions;
export default chatSlice.reducer; 