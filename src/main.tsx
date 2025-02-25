import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './state-management/AuthContext';
import { LanguageProvider } from './state-management/LanguageContext';
import App from './App';
import './index.css';
import { logEnvironmentVariables } from './utils/envLogger';

// Log environment variables to console for debugging
logEnvironmentVariables();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Validate required environment variables
const requiredEnvVars = {
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Check environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  }
});

try {
  createRoot(rootElement).render(
    <StrictMode>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render the application:', error);
  rootElement.innerHTML = `
    <div style="
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
    ">
      <h1 style="color: #1a1a1a; margin-bottom: 16px;">Unable to load the application</h1>
      <p style="color: #666; max-width: 500px;">
        We're experiencing technical difficulties. Please try refreshing the page or contact support if the problem persists.
      </p>
    </div>
  `;
}