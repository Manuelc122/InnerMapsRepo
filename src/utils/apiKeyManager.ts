/**
 * API Key Manager
 * Utility to retrieve API keys from localStorage or environment variables
 */

// Function to get an API key, checking localStorage first, then environment variables
export const getApiKey = (key: string): string => {
  // First check localStorage
  const localStorageValue = localStorage.getItem(key);
  if (localStorageValue) {
    return localStorageValue;
  }
  
  // Then check environment variables
  const envValue = (import.meta.env as any)[key];
  if (envValue && envValue !== `your_${key.toLowerCase().replace('vite_', '')}_here`) {
    return envValue;
  }
  
  // If we get here, the key is not available
  return '';
};

// Specific getters for each API key
export const getDeepseekApiKey = (): string => {
  return getApiKey('VITE_DEEPSEEK_API_KEY');
};

export const getOpenAIApiKey = (): string => {
  return getApiKey('VITE_OPENAI_API_KEY');
};

export const getSupabaseUrl = (): string => {
  return getApiKey('VITE_SUPABASE_URL');
};

export const getSupabaseAnonKey = (): string => {
  return getApiKey('VITE_SUPABASE_ANON_KEY');
};

// Function to check if all required API keys are available
export const areAllApiKeysAvailable = (): boolean => {
  return (
    !!getDeepseekApiKey() &&
    !!getOpenAIApiKey() &&
    !!getSupabaseUrl() &&
    !!getSupabaseAnonKey()
  );
}; 