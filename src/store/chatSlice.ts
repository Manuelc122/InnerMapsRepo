import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  isLoading: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError } = chatSlice.actions;

export default chatSlice.reducer; 