/**
 * Console Prompt Utility
 * Provides an interactive way to enter API keys directly in the browser console
 */

// Function to prompt for API keys in the console
export const promptApiKeysInConsole = () => {
  const placeholderValues = [
    'your_deepseek_api_key_here',
    'your_openai_api_key_here',
    'your_supabase_url_here',
    'your_supabase_anon_key_here'
  ];
  
  const envVars = {
    'VITE_DEEPSEEK_API_KEY': import.meta.env.VITE_DEEPSEEK_API_KEY,
    'VITE_OPENAI_API_KEY': import.meta.env.VITE_OPENAI_API_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY
  };
  
  const missingOrPlaceholder = Object.entries(envVars)
    .filter(([_, value]) => !value || placeholderValues.includes(value))
    .map(([key]) => key);
  
  if (missingOrPlaceholder.length > 0) {
    console.clear();
    console.log('%c🔑 API KEYS REQUIRED 🔑', 'font-size: 24px; font-weight: bold; color: #ff6b6b; background-color: #f8f9fa; padding: 10px; border-radius: 5px;');
    console.log('\n%cPlease enter your API keys below:', 'font-size: 16px; color: #339af0;');
    
    // Define the setApiKey function in the global scope
    (window as any).setApiKey = (key: string, value: string) => {
      console.log(`%cSetting ${key} to: ${value.substring(0, 3)}...${value.substring(value.length - 3)}`, 'color: #51cf66;');
      localStorage.setItem(key, value);
      console.log('%cAPI key saved to localStorage. Please refresh the page.', 'color: #51cf66; font-weight: bold;');
    };
    
    missingOrPlaceholder.forEach(key => {
      console.log(`\n%c${key}:`, 'font-weight: bold; color: #339af0;');
      console.log(`%cEnter your ${key} by running:`, 'color: #51cf66;');
      console.log(`%csetApiKey("${key}", "your-api-key-here")`, 'background-color: #f8f9fa; padding: 5px; border-radius: 3px; font-family: monospace;');
    });
    
    console.log('\n%cAfter entering all keys, refresh the page to apply them.', 'color: #ff6b6b; font-weight: bold;');
    
    return true;
  }
  
  return false;
};

// Function to load API keys from localStorage
export const loadApiKeysFromLocalStorage = () => {
  const keys = [
    'VITE_DEEPSEEK_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let keysLoaded = false;
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // We can't actually modify import.meta.env at runtime,
      // but we can store the values for the app to use
      (window as any)[key] = value;
      keysLoaded = true;
    }
  });
  
  if (keysLoaded) {
    console.log('%cAPI keys loaded from localStorage', 'color: #51cf66; font-weight: bold;');
  }
  
  return keysLoaded;
}; 