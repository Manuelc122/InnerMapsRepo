export interface Database {
  public: {
    Tables: {
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          timestamp: string;
          sentiment_score: number | null;
          sentiment_tags: string[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          timestamp?: string;
          sentiment_score?: number | null;
          sentiment_tags?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          timestamp?: string;
          sentiment_score?: number | null;
          sentiment_tags?: string[] | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          is_user: boolean;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          is_user: boolean;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          is_user?: boolean;
          timestamp?: string;
        };
      };
    };
  };
}