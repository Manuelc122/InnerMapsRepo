export interface ChatMessage {
  id: string;
  message: string;
  is_user: boolean;
  created_at: string;
}

export interface ChatResponse {
  content: string;
  role: 'assistant' | 'user';
}

export interface ConversationContext {
  recentMessages: Message[];
  journalEntries: Array<{
    content: string;
    timestamp: Date;
  }>;
}