# InnerMaps: AI-Powered Personal Journaling Platform

InnerMaps is a sophisticated journaling platform that combines the power of AI with personal reflection to help users gain deeper insights into their thoughts, emotions, and patterns.

## 🌟 Key Features

### Core Functionality
- **Voice Journaling**: Advanced voice-to-text with emotion detection and auto-punctuation
- **AI-Powered Analysis**: Pattern recognition and emotional tracking
- **Smart Prompts**: Contextual journaling prompts based on mood and patterns
- **Analytics Dashboard**: Comprehensive visualization of personal growth metrics
  - Mood Distribution
  - Writing Time Patterns
  - Energy & Intensity Trends
  - Writing Volume Analysis

### Technical Features
- **Real-time Analytics**: Interactive charts powered by Recharts
- **Responsive Design**: Seamless experience across all devices
- **Smooth Animations**: Engaging UI transitions with Framer Motion
- **Secure Authentication**: Robust auth flow via Supabase

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Routing**: React Router
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── marketing/          # Landing and marketing pages components
│   ├── authentication/     # Login, signup, and auth-related components
│   ├── subscription/       # Pricing and subscription components
│   └── shared/            # Common UI elements and layouts
├── state-management/       # Global state and context providers
├── custom-hooks/          # Reusable React hooks and logic
├── utilities/             # Helper functions and common utilities
├── views/                 # Main application views/pages
├── theme/                 # Styling, themes, and design tokens
└── interfaces/            # TypeScript type definitions and interfaces
```

## 🚀 Getting Started

1. **Prerequisites**
   - Node.js (v16+)
   - npm or yarn

2. **Installation**
   ```bash
   git clone https://github.com/your-username/InnerMaps.git
   cd InnerMaps
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Development**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5174`

## 🔒 Security Features

- End-to-end encryption for journal entries
- Secure authentication via Supabase
- Data sovereignty and GDPR compliance
- Regular security audits

## 💻 Development Guidelines

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting

### Component Structure
- Functional components with hooks
- Props typing with TypeScript interfaces
- Modular and reusable design patterns

### State Management
- Context API for global state
- Local state with useState
- Custom hooks for shared logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Production Site](https://innermaps.co)
- [Documentation](https://docs.innermaps.co)
- [Support](mailto:support@innermaps.co)
