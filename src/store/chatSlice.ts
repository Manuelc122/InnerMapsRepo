import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatSession, ChatMessage, TherapySessionState } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';
import { generateResponse } from '../services/chatService';

const initialState: TherapySessionState = {
  sessions: [],
  activeSessionId: null,
  loading: false,
  error: null,
  pendingMessages: {},
};

export const createSession = createAsyncThunk(
  'chat/createSession',
  async () => {
    const session: ChatSession = {
      id: uuidv4(),
      title: 'AI Coach Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return session;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ sessionId, content }: { sessionId: string; content: string }, { getState, dispatch }) => {
    try {
      const state = getState() as { chat: TherapySessionState };
      const session = state.chat.sessions.find(s => s.id === sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // Add user message immediately
      dispatch(chatSlice.actions.addUserMessage({ sessionId, content }));

      // Get AI response
      const aiResponse = await generateResponse([...session.messages, {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      }]);

      return { 
        sessionId, 
        message: aiResponse
      };
    } catch (error) {
      throw error;
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    clearActiveSession: (state) => {
      state.activeSessionId = null;
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(session => session.id !== action.payload);
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    addUserMessage: (state, action: PayloadAction<{ sessionId: string; content: string }>) => {
      const session = state.sessions.find(s => s.id === action.payload.sessionId);
      if (session) {
        const userMessage: ChatMessage = {
          id: uuidv4(),
          role: 'user',
          content: action.payload.content,
          timestamp: new Date().toISOString(),
          pending: false
        };
        session.messages.push(userMessage);
        session.updatedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.activeSessionId = action.payload.id;
        state.loading = false;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create session';
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { sessionId } = action.meta.arg;
        state.loading = true;
        state.error = null;
        state.pendingMessages[sessionId] = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const session = state.sessions.find(s => s.id === action.payload.sessionId);
        if (session) {
          session.messages.push(action.payload.message);
          session.updatedAt = new Date().toISOString();
        }
        state.loading = false;
        delete state.pendingMessages[action.payload.sessionId];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { sessionId } = action.meta.arg;
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
        delete state.pendingMessages[sessionId];
      });
  },
});

export const { setActiveSession, clearActiveSession, deleteSession, clearError } = chatSlice.actions;
export default chatSlice.reducer; 