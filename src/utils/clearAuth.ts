/**
 * Utility to completely clear all Supabase authentication data from browser storage
 */
export const clearAllAuthData = () => {
  console.log('Clearing all Supabase authentication data...');
  
  // Clear all localStorage items related to Supabase
  const supabasePrefix = 'sb-';
  
  // Find all keys that start with the Supabase prefix
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(supabasePrefix)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all found keys
  keysToRemove.forEach(key => {
    console.log(`Removing localStorage item: ${key}`);
    localStorage.removeItem(key);
  });
  
  // Also clear sessionStorage items
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(supabasePrefix)) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    console.log(`Removing sessionStorage item: ${key}`);
    sessionStorage.removeItem(key);
  });
  
  // Clear cookies related to Supabase
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name && name.trim().startsWith(supabasePrefix)) {
      console.log(`Removing cookie: ${name}`);
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    }
  });
  
  console.log('All Supabase authentication data cleared');
  
  return {
    keysRemoved: keysToRemove.length + sessionKeysToRemove.length
  };
}; 