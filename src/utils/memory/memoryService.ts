import { supabase } from '../supabaseClient';
// import { generateEmbedding } from './embeddingService';
import { batchGenerateMemorySummaries } from './summaryService';
import { getProfile } from '../profile';

// Maximum number of memories a user can have
export const MEMORY_LIMIT = 150;

// Temporary placeholder for the missing function
const generateEmbedding = async (text: string): Promise<number[] | null> => {
  console.log('Embedding generation is temporarily disabled');
  return null;
};

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  source_id: string;
  source_type: 'journal_entry' | 'chat_message';
  importance: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  user_notes?: string;
  summary?: string;
  embedding?: number[];
}

export interface MemoryQuota {
  used: number;
  total: number;
  percentage: number;
}

// Helper function to get the Supabase client
function getSupabaseClient() {
  return supabase;
}

/**
 * Fetches all memories for the current user
 */
export async function fetchMemories(userId: string) {
  try {
    const { data, error } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching memories:', error);
    return { data: null, error };
  }
}

/**
 * Fetches active (non-archived) memories for the current user
 */
export async function fetchActiveMemories(userId: string) {
  try {
    const { data, error } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('is_pinned', { ascending: false })
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching active memories:', error);
    return { data: null, error };
  }
}

/**
 * Updates a memory
 */
export async function updateMemory(memoryId: string, updates: Partial<Memory>) {
  try {
    const { error } = await supabase
      .from('coach_memories')
      .update(updates)
      .eq('id', memoryId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating memory:', error);
    return { success: false, error };
  }
}

/**
 * Deletes a memory
 */
export async function deleteMemory(memoryId: string) {
  try {
    const { error } = await supabase
      .from('coach_memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return { success: false, error };
  }
}

/**
 * Creates a new memory
 */
export async function createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Check if the user has reached their memory limit
    const { count, error: countError } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', memory.user_id);
    
    if (countError) {
      console.error('Error checking memory count:', countError);
      throw countError;
    }
    
    // If the user has reached their limit, don't create a new memory
    if (count && count >= MEMORY_LIMIT) {
      console.warn(`Memory limit reached (${count}/${MEMORY_LIMIT}). Not creating new memory.`);
      return { 
        data: null, 
        error: new Error(`Memory limit of ${MEMORY_LIMIT} reached. Please delete some memories to make room for new ones.`) 
      };
    }
    
    // Generate embedding if not provided
    let memoryWithEmbedding = { ...memory };
    if (!memory.embedding) {
      const content = memory.summary || memory.content;
      const embedding = await generateEmbedding(content);
      if (embedding) {
        memoryWithEmbedding.embedding = embedding;
      }
    }

    const { data, error } = await supabase
      .from('coach_memories')
      .insert(memoryWithEmbedding)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating memory:', error);
    return { data: null, error };
  }
}

/**
 * Fetches memory quota for the current user
 */
export async function fetchMemoryQuota(userId: string): Promise<MemoryQuota> {
  try {
    // Get the count of active memories
    const { count, error } = await supabase
      .from('coach_memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_archived', false);

    if (error) throw error;

    // Use the constant for the total quota
    const total = MEMORY_LIMIT;
    const used = count || 0;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  } catch (error) {
    console.error('Error fetching memory quota:', error);
    // Return default values if there's an error
    return { used: 0, total: MEMORY_LIMIT, percentage: 0 };
  }
}

/**
 * Searches for memories based on semantic similarity
 */
export async function searchMemoriesBySimilarity(userId: string, query: string, limit = 5) {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // If embedding generation is disabled, fall back to keyword search
    if (!embedding) {
      console.log('Embedding generation is disabled, falling back to keyword search');
      return fallbackKeywordSearch(userId, query, limit);
    }

    // Search for similar memories using vector similarity
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      p_user_id: userId
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching memories by similarity:', error);
    // Fall back to keyword search on error
    return fallbackKeywordSearch(userId, query, limit);
  }
}

/**
 * Fallback search method when embeddings are not available
 * Uses simple text matching instead of semantic similarity
 */
async function fallbackKeywordSearch(userId: string, query: string, limit = 5) {
  try {
    console.log('Using fallback keyword search for memories');
    // Extract keywords from the query (simple implementation)
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3) // Only use words longer than 3 chars
      .slice(0, 5); // Use at most 5 keywords
    
    if (keywords.length === 0) {
      // If no good keywords, just get recent memories
      const { data, error } = await supabase
        .from('coach_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    }
    
    // Build a query that searches for any of the keywords in content or summary
    let queryBuilder = supabase
      .from('coach_memories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false);
    
    // Add OR conditions for each keyword
    const keywordConditions = keywords.map(keyword => 
      `content.ilike.%${keyword}%,summary.ilike.%${keyword}%`
    ).join(',');
    
    queryBuilder = queryBuilder.or(keywordConditions);
    
    // Execute the query
    const { data, error } = await queryBuilder
      .order('is_pinned', { ascending: false })
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in fallback keyword search:', error);
    // If all else fails, return recent memories
    try {
      const { data, error } = await supabase
        .from('coach_memories')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (finalError) {
      console.error('Final fallback error:', finalError);
      return { data: [], error: finalError };
    }
  }
}

/**
 * Retrieves relevant memories for the current conversation
 */
export async function getRelevantMemories(userId: string, conversationContext: string, limit = 5) {
  try {
    // First, get pinned memories (always included)
    const { data: pinnedMemories, error: pinnedError } = await supabase
      .from('coach_memories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_pinned', true)
      .eq('is_archived', false)
      .limit(limit);

    if (pinnedError) throw pinnedError;

    // If we have enough pinned memories, return them
    if (pinnedMemories && pinnedMemories.length >= limit) {
      return { data: pinnedMemories, error: null };
    }

    // Otherwise, get additional relevant memories based on similarity
    const remainingLimit = limit - (pinnedMemories?.length || 0);
    const { data: similarMemories, error: similarError } = await searchMemoriesBySimilarity(
      userId,
      conversationContext,
      remainingLimit
    );

    if (similarError) {
      console.warn('Error getting similar memories, using only pinned memories:', similarError);
      return { data: pinnedMemories || [], error: null };
    }

    // Combine pinned and similar memories, removing duplicates
    const pinnedIds = new Set(pinnedMemories?.map((m: Memory) => m.id) || []);
    const uniqueSimilarMemories = similarMemories?.filter((m: Memory) => !pinnedIds.has(m.id)) || [];
    const combinedMemories = [...(pinnedMemories || []), ...uniqueSimilarMemories];

    return { data: combinedMemories, error: null };
  } catch (error) {
    console.error('Error getting relevant memories:', error);
    // Return empty array instead of propagating the error
    return { data: [], error: null };
  }
}

/**
 * Generates a summary of all active memories
 */
export async function generateMemorySummary(userId: string) {
  try {
    const { data: memories, error } = await fetchActiveMemories(userId);
    if (error) throw error;

    if (!memories || memories.length === 0) {
      return { summary: "No memories available.", error: null };
    }

    // Group memories by themes or topics
    // This is a placeholder - in a real implementation, you would use
    // a more sophisticated approach to group and summarize memories
    const groupedMemories = groupMemoriesByTheme(memories);

    // Generate summary for each group
    let summary = "Memory Summary:\n\n";
    Object.entries(groupedMemories).forEach(([theme, themeMemories]) => {
      summary += `${theme}:\n`;
      themeMemories.forEach(memory => {
        const content = memory.summary || memory.content.substring(0, 100) + (memory.content.length > 100 ? '...' : '');
        summary += `- ${content}\n`;
      });
      summary += '\n';
    });

    return { summary, error: null };
  } catch (error) {
    console.error('Error generating memory summary:', error);
    return { summary: null, error };
  }
}

/**
 * Helper function to group memories by theme
 * This is a placeholder implementation
 */
function groupMemoriesByTheme(memories: Memory[]) {
  // Simple grouping by source_type for now
  const grouped: Record<string, Memory[]> = {};
  
  memories.forEach((memory: Memory) => {
    const key = memory.source_type;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(memory);
  });
  
  return grouped;
}

/**
 * Updates summaries for memories that don't have them
 * @param userId The user ID to update summaries for
 * @returns Object with success status and count of updated memories
 */
export async function updateMemorySummaries(userId: string): Promise<{ success: boolean, updatedCount: number, error?: string }> {
  try {
    console.log('Starting summary generation for user:', userId);
    const supabase = getSupabaseClient();
    
    // Get user profile to personalize summaries
    console.log('Fetching user profile...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    
    // Directly fetch profile from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }
    
    // Extract first name from full_name or use email as fallback
    let firstName = null;
    if (profileData && profileData.full_name) {
      const nameParts = profileData.full_name.split(' ');
      firstName = nameParts[0] || null;
      console.log(`Extracted first name "${firstName}" from full name "${profileData.full_name}"`);
    } else if (session.user.email) {
      firstName = session.user.email.split('@')[0];
      console.log(`Using email username "${firstName}" as fallback`);
    }
    
    console.log('User first name for personalization:', firstName || 'Not available');
    
    if (firstName) {
      console.log(`Will personalize summaries for ${firstName}`);
    } else {
      console.log('No user name available for personalization, using generic summaries');
    }
    
    // Get memories without summaries
    console.log('Fetching memories without summaries...');
    const { data: memories, error: fetchError } = await supabase
      .from('coach_memories')
      .select('id, content')
      .eq('user_id', userId)
      .is('summary', null);
    
    if (fetchError) {
      console.error('Error fetching memories without summaries:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${memories?.length || 0} memories without summaries`);
    
    if (!memories || memories.length === 0) {
      console.log('No memories need summaries');
      return { success: true, updatedCount: 0 };
    }
    
    // Generate summaries for memories
    console.log('Generating summaries for memories...');
    const summaries = await batchGenerateMemorySummaries(memories, firstName);
    console.log(`Generated ${summaries.length} summaries`);
    
    // Update memories with generated summaries
    let updatedCount = 0;
    for (const { id, summary } of summaries) {
      if (summary) {
        console.log(`Updating memory ${id} with summary: ${summary.substring(0, 50)}...`);
        const { error: updateError } = await supabase
          .from('coach_memories')
          .update({ summary })
          .eq('id', id)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`Error updating memory ${id}:`, updateError);
        } else {
          console.log(`Successfully updated memory ${id}`);
          updatedCount++;
        }
      } else {
        console.log(`No summary generated for memory ${id}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} memories with summaries`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error updating memory summaries:', error);
    return { 
      success: false, 
      updatedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error updating summaries' 
    };
  }
}

/**
 * Updates existing summaries to include the user's first name
 * @param userId The user ID to update summaries for
 * @returns Object with success status and count of updated memories
 */
export async function updateExistingSummariesWithName(userId: string): Promise<{ success: boolean, updatedCount: number, error?: string }> {
  try {
    console.log('Starting update of existing summaries for user:', userId);
    const supabase = getSupabaseClient();
    
    // Get user profile to personalize summaries
    console.log('Fetching user profile...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    
    // Directly fetch profile from Supabase
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }
    
    // Extract first name from full_name or use email as fallback
    let firstName = null;
    if (profileData && profileData.full_name) {
      const nameParts = profileData.full_name.split(' ');
      firstName = nameParts[0] || null;
      console.log(`Extracted first name "${firstName}" from full name "${profileData.full_name}"`);
    } else if (session.user.email) {
      firstName = session.user.email.split('@')[0];
      console.log(`Using email username "${firstName}" as fallback`);
    }
    
    if (!firstName) {
      console.log('No user name available for personalization, skipping update');
      return { success: false, updatedCount: 0, error: 'No user name available' };
    }
    
    console.log(`Will update summaries to include name: ${firstName}`);
    
    // Get memories with summaries that don't include the first name
    console.log('Fetching memories with summaries...');
    const { data: memories, error: fetchError } = await supabase
      .from('coach_memories')
      .select('id, content, summary')
      .eq('user_id', userId)
      .not('summary', 'is', null);
    
    if (fetchError) {
      console.error('Error fetching memories with summaries:', fetchError);
      throw fetchError;
    }
    
    // Filter memories whose summaries don't include the first name
    const memoriesToUpdate = memories?.filter(memory => 
      memory.summary && !memory.summary.toLowerCase().includes(firstName.toLowerCase())
    ) || [];
    
    console.log(`Found ${memoriesToUpdate.length} memories with summaries that don't include the name "${firstName}"`);
    
    if (memoriesToUpdate.length === 0) {
      console.log('No summaries need updating');
      return { success: true, updatedCount: 0 };
    }
    
    // Prepare memories for batch summary generation
    const memoryBatch = memoriesToUpdate.map(memory => ({
      id: memory.id,
      content: memory.content
    }));
    
    // Generate new summaries for these memories
    console.log('Generating new personalized summaries...');
    const summaries = await batchGenerateMemorySummaries(memoryBatch, firstName);
    console.log(`Generated ${summaries.length} new personalized summaries`);
    
    // Update memories with new personalized summaries
    let updatedCount = 0;
    for (const { id, summary } of summaries) {
      if (summary) {
        console.log(`Updating memory ${id} with personalized summary: ${summary.substring(0, 50)}...`);
        const { error: updateError } = await supabase
          .from('coach_memories')
          .update({ summary })
          .eq('id', id)
          .eq('user_id', userId);
        
        if (updateError) {
          console.error(`Error updating memory ${id}:`, updateError);
        } else {
          console.log(`Successfully updated memory ${id}`);
          updatedCount++;
        }
      } else {
        console.log(`No summary generated for memory ${id}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} memories with personalized summaries`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error updating existing summaries:', error);
    return { 
      success: false, 
      updatedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error updating summaries' 
    };
  }
} 