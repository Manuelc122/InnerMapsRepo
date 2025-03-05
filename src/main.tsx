import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './state-management/AuthContext';
import { LanguageProvider } from './state-management/LanguageContext';
import App from './App';
import './index.css';
import { logEnvironmentVariables } from './utils/envLogger';
import { promptApiKeysInConsole, loadApiKeysFromLocalStorage } from './utils/consolePrompt';

// Add global function to redirect to payment page
declare global {
  interface Window {
    redirectToPayment: () => void;
    // Define the Wompi types properly
    WompiWidget?: {
      render: (element: HTMLElement, options: any) => void;
      open: (options: any) => void;
    };
    WidgetCheckout?: any;
  }
}

// Function to redirect to payment page
window.redirectToPayment = () => {
  window.location.href = `${window.location.origin}/payment/direct`;
};

// Log environment variables to console for debugging
logEnvironmentVariables();

// Load API keys from localStorage if available
loadApiKeysFromLocalStorage();

// Prompt for API keys in the console if needed
promptApiKeysInConsole();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Validate required environment variables
const requiredEnvVars = {
  'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'VITE_DEEPSEEK_API_KEY': import.meta.env.VITE_DEEPSEEK_API_KEY,
  'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY
};

// Check environment variables and prompt for missing ones
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

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
      ${missingEnvVars.length > 0 ? `
      <div style="margin-top: 20px; padding: 16px; background-color: #fff8e6; border: 1px solid #ffd77a; border-radius: 8px; max-width: 500px; text-align: left;">
        <h2 style="color: #b45309; font-size: 18px; margin-bottom: 8px;">Missing API Keys</h2>
        <p style="color: #78350f; margin-bottom: 12px;">
          The application requires API keys to function properly.
        </p>
        <p style="color: #78350f;">
          Please check the browser console (F12) for instructions on how to enter your API keys.
        </p>
      </div>
      ` : ''}
    </div>
  `;
}