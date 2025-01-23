import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { 
  getChatResponse, 
  saveChatMessage, 
  getChatHistory, 
  initializeChat,
  clearChatHistory 
} from '../lib/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ErrorAlert } from './ui/ErrorAlert';
import { ConfirmButton } from './ui/ConfirmButton';
import type { Message } from '../lib/chat/types';

// Rest of the component remains the same...