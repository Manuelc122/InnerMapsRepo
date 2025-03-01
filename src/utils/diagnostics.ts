import { supabase } from '../lib/supabase';

/**
 * Utility functions for diagnosing database and authentication issues
 */

/**
 * Check if a table exists in the database
 * This uses a more compatible approach by attempting to query the table directly
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Checking if table '${tableName}' exists...`);
    
    // Try to query the table with a limit of 0 to check if it exists
    // This is more compatible than querying information_schema
    const { error } = await supabase
      .from(tableName)
      .select('count')
      .limit(0);
    
    // If there's no error, the table exists
    const exists = !error;
    console.log(`Table '${tableName}' ${exists ? 'exists' : 'does not exist'}`);
    
    if (error) {
      console.error(`Error checking table existence:`, error);
    }
    
    return exists;
  } catch (error) {
    console.error(`Error checking table existence:`, error);
    return false;
  }
};

/**
 * Get basic information about a table by examining a sample row
 * This is a workaround since we can't directly access information_schema
 */
export const getTableSchema = async (tableName: string) => {
  try {
    console.log(`Getting schema information for table '${tableName}'...`);
    
    // Try to get a single row to examine its structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error getting table schema:`, error);
      return null;
    }
    
    if (!data || data.length === 0) {
      // If no rows exist, try to get column names at least
      console.log(`No data in table '${tableName}', attempting to get column names...`);
      
      // We can't get column names without data, so we'll return a placeholder
      return { 
        note: "Table exists but is empty. Cannot determine schema without data.",
        columns: []
      };
    }
    
    // Extract column names and types from the first row
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow).map(columnName => {
      return {
        column_name: columnName,
        data_type: typeof sampleRow[columnName],
        sample_value: sampleRow[columnName]
      };
    });
    
    console.log(`Schema for table '${tableName}':`, columns);
    return { columns, sampleRow };
  } catch (error) {
    console.error(`Error getting table schema:`, error);
    return null;
  }
};

/**
 * Check authentication status
 */
export const checkAuthStatus = async () => {
  try {
    console.log('Checking authentication status...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false, error: error.message };
    }
    
    const isAuthenticated = !!data.session;
    console.log(`User is ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
    
    if (isAuthenticated) {
      console.log('User ID:', data.session?.user?.id);
    }
    
    return { 
      authenticated: isAuthenticated,
      userId: data.session?.user?.id,
      session: data.session
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { authenticated: false, error: String(error) };
  }
};

/**
 * Check if user has memories
 */
export const checkUserMemories = async (userId?: string) => {
  try {
    if (!userId) {
      const authStatus = await checkAuthStatus();
      userId = authStatus.userId;
      
      if (!userId) {
        console.error('No user ID available to check memories');
        return { hasMemories: false, error: 'No user ID available' };
      }
    }
    
    console.log(`Checking memories for user ID: ${userId}`);
    
    const { data, error } = await supabase
      .from('coach_memories')
      .select('id, content')
      .eq('user_id', userId)
      .limit(5);
    
    if (error) {
      console.error('Error checking user memories:', error);
      return { hasMemories: false, error: error.message };
    }
    
    const hasMemories = data && data.length > 0;
    console.log(`User ${hasMemories ? 'has' : 'does not have'} memories`);
    
    return { 
      hasMemories,
      count: data?.length || 0,
      samples: data
    };
  } catch (error) {
    console.error('Error checking user memories:', error);
    return { hasMemories: false, error: String(error) };
  }
};

/**
 * Create a test memory for debugging
 */
export const createTestMemory = async (userId?: string) => {
  try {
    if (!userId) {
      const authStatus = await checkAuthStatus();
      userId = authStatus.userId;
      
      if (!userId) {
        console.error('No user ID available to create test memory');
        return { success: false, error: 'No user ID available' };
      }
    }
    
    console.log(`Creating test memory for user ID: ${userId}`);
    
    const testMemory = {
      user_id: userId,
      content: `Test memory created at ${new Date().toISOString()}`,
      source_id: 'test-source',
      source_type: 'journal_entry',
      importance: 2,
      is_pinned: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('coach_memories')
      .insert([testMemory])
      .select();
    
    if (error) {
      console.error('Error creating test memory:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Test memory created successfully:', data);
    return { success: true, memory: data[0] };
  } catch (error) {
    console.error('Error creating test memory:', error);
    return { success: false, error: String(error) };
  }
}; 