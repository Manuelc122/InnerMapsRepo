import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './state-management/AuthContext';
import { LanguageProvider } from './state-management/LanguageContext';
import App from './App';
import './index.css';

// Validate required environment variables
const requiredEnvVars = {
  'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>
);