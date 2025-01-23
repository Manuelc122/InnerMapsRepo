export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatResponse {
  content: string;
  suggestedTopics: string[];
}

export interface ConversationContext {
  recentMessages: Message[];
  journalEntries: Array<{
    content: string;
    timestamp: Date;
  }>;
}