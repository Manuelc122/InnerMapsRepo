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

---

Built with ❤️ for better mental health
