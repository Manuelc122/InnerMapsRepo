import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'chat/sendMessage/pending',
          'chat/sendMessage/fulfilled',
          'chat/sendMessage/rejected'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.messages.*.timestamp'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'chat.sessions.*.messages.*.timestamp',
          'chat.sessions.*.createdAt',
          'chat.sessions.*.updatedAt'
        ],
      },
      immutableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 