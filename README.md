# InnerMaps - AI-Powered Journal & Mental Health Analytics

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.18.0-purple.svg)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green.svg)](https://supabase.io/)

InnerMaps is a sophisticated mental health journaling platform that combines the power of AI with personal journaling to provide users with deep insights into their emotional well-being. The application features an intelligent chat interface, mood tracking, and comprehensive analytics to help users better understand their mental health patterns.

## 🌟 Key Features

### 1. Smart Journaling
- **AI-Enhanced Journal Entries**: Contextual analysis of journal entries to identify patterns and emotions
- **Mood Tracking**: Track your daily mood with an intuitive interface
- **Rich Text Formatting**: Support for markdown formatting including bold, headers, and bullet points

### 2. Intelligent Chat Interface
- **Context-Aware AI Assistant**: Chatbot that references your previous journal entries for personalized support
- **Natural Language Processing**: Advanced text processing for better understanding of user intent
- **Markdown Support**: Rich text formatting in chat messages for better expression

### 3. Analytics Dashboard
- **Mood Pattern Analysis**: Visual representations of mood trends over time
- **Interactive Charts**: Powered by Recharts for comprehensive data visualization
- **Insight Generation**: AI-powered analysis of journaling patterns and emotional trends

### 4. Security & Privacy
- **Secure Authentication**: Powered by Supabase for reliable user authentication
- **Data Encryption**: Secure storage of sensitive user information
- **Private Journaling**: Personal space that's completely private and secure

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: Custom AI implementation with advanced NLP
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Build Tool**: Vite

## 💻 Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/InnerMapsRepo.git
   cd InnerMapsRepo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_DEEPSEEK_API_KEY=your_ai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🌐 Production Deployment

The application is deployed and accessible at [https://innermaps.co](https://innermaps.co)

### Deployment Features
- **CI/CD Pipeline**: Automated deployment with GitHub Actions
- **Edge Functions**: Optimized serverless functions for AI processing
- **Global CDN**: Fast content delivery worldwide
- **Automatic HTTPS**: Secure SSL/TLS encryption
- **Database Backups**: Regular automated backups of user data

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── views/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── state-management/   # Context and state management
├── theme/             # Theme configuration
├── interfaces/        # TypeScript interfaces
└── custom-hooks/     # Additional custom hooks
```

## 🔑 Core Components

### ChatMessage Component
- Handles message formatting and display
- Supports markdown and custom formatting
- Integrates with AI context processing

### Journal Analytics
- Processes journal entries for patterns
- Generates mood analytics
- Creates visual representations of data

### Authentication Flow
- Manages user sessions
- Handles secure login/logout
- Protects private routes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Contact

For support or inquiries, please contact us at [support@innermaps.co](mailto:support@innermaps.co) or visit [innermaps.co](https://innermaps.co).

## Setting up Chat Tables

To set up the chat functionality, you need to create the necessary database tables in Supabase. Follow these steps:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for selecting chat sessions
CREATE POLICY select_own_chat_sessions ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for inserting chat sessions
CREATE POLICY insert_own_chat_sessions ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating chat sessions
CREATE POLICY update_own_chat_sessions ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting chat sessions
CREATE POLICY delete_own_chat_sessions ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy for selecting chat messages
CREATE POLICY select_own_chat_messages ON chat_messages
  FOR SELECT USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for inserting chat messages
CREATE POLICY insert_own_chat_messages ON chat_messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for updating chat messages
CREATE POLICY update_own_chat_messages ON chat_messages
  FOR UPDATE USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Policy for deleting chat messages
CREATE POLICY delete_own_chat_messages ON chat_messages
  FOR DELETE USING (
    chat_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
```

5. Run the query to create the tables and policies

---

Built with ❤️ for better mental health
