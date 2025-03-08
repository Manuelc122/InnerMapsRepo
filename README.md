# InnerMaps - AI-Powered Journal & Mental Health Analytics

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.18.0-purple.svg)](https://www.framer.com/motion/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green.svg)](https://supabase.io/)

## 🧭 The InnerMaps Journey: Navigating Your Inner Landscape

Just as explorers use maps to navigate unfamiliar territories, **InnerMaps** provides you with the tools to chart and navigate your inner emotional landscape. In a world where we're taught how to understand the external world but rarely given guidance on understanding ourselves, InnerMaps serves as your personal guide to emotional intelligence and self-discovery.

### The Cartography of Consciousness

Traditional maps help us understand physical terrain—mountains, rivers, cities, and roads. Similarly, InnerMaps helps you identify and understand your emotional terrain:

- **Emotional Peaks and Valleys**: Recognize patterns in your moods and emotional responses
- **Rivers of Thought**: Track how your thoughts flow and connect over time
- **Landmarks of Experience**: Identify significant events and their impact on your mental landscape
- **Paths of Growth**: Discover routes toward better mental health and emotional resilience

### Why Mental Mapping Matters

In today's fast-paced world, many of us experience emotional turbulence without understanding its origins or patterns. Without a map, we can feel lost in our own minds. InnerMaps addresses this fundamental human need by:

- **Building Self-Awareness**: Helping you recognize emotional patterns you may never have noticed
- **Fostering Emotional Intelligence**: Teaching you to name, understand, and regulate your emotions
- **Promoting Mental Health**: Providing early warning signs of emotional distress
- **Empowering Personal Growth**: Giving you agency over your emotional development

### The Science Behind the Journey

InnerMaps combines the latest research in cognitive behavioral therapy, positive psychology, and neuroscience with cutting-edge AI technology. This powerful combination creates a personalized experience that grows more insightful the more you use it—like a map that becomes more detailed with each expedition.

By journaling regularly and engaging with your AI coach, you're not just recording thoughts—you're actively participating in your own emotional education and mental health maintenance.

---

InnerMaps is a sophisticated mental health journaling platform that combines the power of AI with personal journaling to provide users with deep insights into their emotional well-being. The application features an intelligent chat interface, mood tracking, and comprehensive analytics to help users better understand their mental health patterns.

## 🌟 Key Features

### 1. Smart Journaling
- **AI-Enhanced Journal Entries**: Contextual analysis of journal entries to identify patterns and emotions
- **Mood Tracking**: Track your daily mood with an intuitive interface
- **Rich Text Formatting**: Support for markdown formatting including bold, headers, and bullet points
- **Voice Recording**: Dictate journal entries with automatic transcription

### 2. Intelligent Coach Chat
- **Context-Aware AI Assistant**: Chatbot that references your previous journal entries for personalized support
- **Memory Integration**: Leverages memories generated from journal entries to provide relevant guidance
- **Conversation Management**: Create and manage multiple chat sessions
- **Markdown Support**: Rich text formatting in chat messages for better expression

### 3. Memory Management
- **AI-Generated Memories**: Automatically extracts insights from journal entries and conversations
- **Memory Organization**: Pin, archive, and delete memories as needed
- **Semantic Search**: Find relevant memories based on content similarity
- **Memory Quota**: Track and manage memory usage with visual indicators

### 4. Security & Privacy
- **Secure Authentication**: Powered by Supabase for reliable user authentication
- **Data Encryption**: Secure storage of sensitive user information
- **Private Journaling**: Personal space that's completely private and secure

## 📱 Core Application Tabs

### Journal Tab
The Journal tab provides a personal journaling system where users can record, save, and review their thoughts and experiences.

**Key Features:**
- **Entry Creation and Editing**: Create new entries or edit existing ones with a clean, distraction-free interface
- **Entry Management**: Browse past entries chronologically with search functionality
- **Voice Recording**: Dictate entries using the built-in voice recorder with automatic transcription
- **Personalization**: Interface adapts to display the user's name for a more personal experience

**Technical Implementation:**
- Implemented in `src/views/Dashboard.tsx`
- Uses `saveJournalEntry` and `deleteJournalEntry` utilities for data persistence
- Stores entries in the `journal_entries` table in Supabase
- Automatically generates memories from journal entries for AI analysis

### Coach Chat Tab
The Coach Chat tab provides an AI coaching experience that leverages the user's journal entries to offer personalized guidance and insights.

**Key Features:**
- **Chat Sessions**: Create and manage multiple conversation threads
- **AI-Powered Responses**: Utilizes OpenAI's GPT models for intelligent, context-aware responses
- **Memory Integration**: Incorporates relevant memories from journal entries into conversations
- **Conversation History**: Maintains a complete history of all interactions for continuity

**Technical Implementation:**
- Implemented in `src/views/CoachChat.tsx`
- Uses `getRelevantMemories` to retrieve memories related to the conversation context
- Stores chat sessions in the `chat_sessions` table and messages in the `chat_messages` table
- Supports markdown formatting for rich text responses

### Memory Manager Tab
The Memory Manager tab allows users to view, organize, and manage the AI-generated memories derived from their journal entries and chat conversations.

**Key Features:**
- **Memory Display**: View memories in a card-based interface with summaries and source information
- **Memory Actions**: Pin important memories, archive less relevant ones, or delete as needed
- **Memory Search**: Find specific memories using semantic search capabilities
- **Memory Quota**: Visual representation of memory usage with warnings when approaching limits

**Technical Implementation:**
- Implemented in `src/components/Memory/MemoryManager.tsx`
- Uses `memoryService.ts` for memory retrieval, creation, and management
- Stores memories in the `coach_memories` table with a limit of 150 memories per user
- Supports automatic generation of memory summaries using AI

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Integration**: OpenAI API with GPT-4o-mini model
- **Animations**: Framer Motion
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
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_WOMPI_PUBLIC_KEY=your_wompi_public_key
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
│   ├── Memory/          # Memory management components
│   ├── Profile/         # User profile components
│   ├── shared/          # Shared UI components
│   └── subscription/    # Subscription management components
├── views/               # Page components
│   ├── Dashboard.tsx    # Journal tab implementation
│   ├── CoachChat.tsx    # Coach Chat tab implementation
│   └── MemoryDiagnostic.tsx # Memory diagnostics view
├── utils/               # Utility functions
│   ├── journal.ts       # Journal entry utilities
│   └── memory/          # Memory management utilities
├── state-management/    # Context and state management
│   ├── AuthContext.tsx  # Authentication context
│   ├── UserNameContext.tsx # User name context
│   └── SubscriptionContext.tsx # Subscription context
├── services/            # Service integrations
│   └── paymentService.ts # Payment processing service
├── interfaces/          # TypeScript interfaces
└── custom-hooks/        # Custom React hooks
```

## 🔄 Data Flow Between Components

The three main tabs work together to create a cohesive experience:

1. **Journal → Memory**: 
   - Journal entries trigger memory creation
   - Memories extract insights from journal entries
   - The system has a limit of 150 memories per user

2. **Memory → Coach Chat**:
   - Coach Chat uses memories to provide personalized guidance
   - Relevant memories are retrieved based on conversation context
   - Pinned memories are prioritized in the retrieval process

3. **Coach Chat → Memory**:
   - Important insights from chat conversations can become memories
   - Chat sessions provide context for memory retrieval
   - The AI coach references memories to maintain continuity

## 📊 Database Structure

- **journal_entries**: Stores user journal entries
- **chat_sessions**: Stores chat session metadata
- **chat_messages**: Stores individual messages in chats
- **coach_memories**: Stores AI-generated memories
- **profiles**: Stores user profile information
- **subscriptions**: Stores user subscription information

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

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Run `node --experimental-modules scripts/setup-stripe-keys.js` to set up Stripe API keys
4. Start the development server: `npm run dev`

## Features

- Smart journaling with rich text formatting
- AI coach chat with personalized guidance
- Automatic memory extraction and organization
- Semantic search to find relevant memories and insights
- Voice-to-text transcription for natural expression

## Subscription Plans

InnerMaps offers two subscription plans:
- **Monthly Plan**: $12/month
- **Yearly Plan**: $120/year (17% savings)

## Admin Dashboard

### How to Access the Admin Dashboard

1. **Login with an Admin Account**:
   - Use the email `admin@innermaps.co` to log in
   - This account has special admin privileges

2. **Navigate to the Admin Dashboard**:
   - After logging in, you'll see an "Admin" link in the top navigation bar
   - Click on this link to access the admin dashboard

3. **Admin Features**:
   - **Exempt Users Management**: Add or remove users from the payment exemption list
   - Grant free subscriptions to specific users
   - View all currently exempt users

### Managing Exempt Users

1. From the admin dashboard, click on "Exempt Users Management"
2. To add a new exempt user:
   - Enter their email address
   - Select the plan type (monthly or yearly)
   - Click "Add User"
3. To remove an exempt user, click the "Remove" button next to their email

## Development

- Built with React, TypeScript, and Vite
- Uses Tailwind CSS for styling
- Integrates with Stripe for payment processing
