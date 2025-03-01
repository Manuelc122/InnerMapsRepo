import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Archive, Trash2, Edit, Info, AlertCircle, Search, RefreshCw, UserRound, Loader2 } from 'lucide-react';
import { useAuth } from '../../state-management/AuthContext';
import { supabase } from '../../utils/supabaseClient';  // Changed from '../../lib/supabase' to '../../utils/supabaseClient'
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { updateMemorySummaries, updateExistingSummariesWithName } from '../../utils/memory/memoryService';
import { generateMemorySummary } from '../../utils/memory/summaryService';

interface MemoryItem {
  id: string;
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
}

// Maximum number of memories a user can have
const MEMORY_LIMIT = 150;

export function MemoryManager() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoryQuota, setMemoryQuota] = useState({ used: 0, total: MEMORY_LIMIT });
  const [editMode, setEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [isPersonalizingSummaries, setIsPersonalizingSummaries] = useState(false);

  useEffect(() => {
    console.log('MemoryManager mounted. Auth state:', {
      user: user?.id || 'none',
      loading: authLoading,
      error: authError
    });

    const initializeMemories = async () => {
      if (authLoading) {
        console.log('Auth is still loading, waiting...');
        return;
      }

      // Add direct session check
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Direct session check:', sessionData);
        
        if (sessionData.session) {
          console.log('Session exists directly:', sessionData.session.user.id);
        } else {
          console.log('No session found in direct check');
        }
      } catch (sessionError) {
        console.error('Error checking session directly:', sessionError);
      }

      if (!user) {
        console.log('No user found in auth context');
        setError('No active session. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting current user:', userError);
          throw userError;
        }

        if (!currentUser) {
          console.log('No active user session found');
          setError('No active session. Please sign in.');
          setLoading(false);
          return;
        }

        console.log('Current user verified:', currentUser.id);
        await fetchMemories(currentUser.id);
        
        // Automatically generate summaries and personalize them in the background
        handleGenerateSummaries();
        handlePersonalizeSummaries();
      } catch (error) {
        console.error('Error initializing memories:', error);
        setError('Failed to initialize memories. Please try again.');
        setLoading(false);
      }
    };

    initializeMemories();
  }, [user, authLoading]);

  const fetchMemories = async (userId: string) => {
    try {
      console.log('Fetching memories for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('coach_memories')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching memories:', fetchError);
        throw fetchError;
      }

      console.log('Fetched memories:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Sample memory:', {
          id: data[0].id,
          user_id: data[0].user_id,
          source_type: data[0].source_type,
          has_summary: !!data[0].summary
        });
      }
      
      setMemories(data || []);
      setError(null);
      
      // Update memory quota after fetching memories
      updateMemoryQuota(data?.length || 0);
    } catch (err) {
      console.error('Memory fetch error:', err);
      setError('Failed to fetch memories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateMemoryQuota = (memoryCount: number) => {
    setMemoryQuota({
      used: memoryCount,
      total: MEMORY_LIMIT
    });
    
    // Log a warning if approaching the limit
    if (memoryCount >= MEMORY_LIMIT * 0.9) {
      console.warn(`Memory usage is high: ${memoryCount}/${MEMORY_LIMIT} (${Math.round(memoryCount/MEMORY_LIMIT*100)}%)`);
    }
  };

  const togglePin = async (memory: MemoryItem) => {
    try {
      const { error } = await supabase
        .from('coach_memories')
        .update({ is_pinned: !memory.is_pinned })
        .eq('id', memory.id);

      if (error) throw error;
      
      // Update local state
      setMemories(memories.map(m => 
        m.id === memory.id ? { ...m, is_pinned: !m.is_pinned } : m
      ));
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const toggleArchive = async (memory: MemoryItem) => {
    try {
      const { error } = await supabase
        .from('coach_memories')
        .update({ is_archived: !memory.is_archived })
        .eq('id', memory.id);

      if (error) throw error;
      
      // Update local state
      setMemories(memories.map(m => 
        m.id === memory.id ? { ...m, is_archived: !m.is_archived } : m
      ));
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const deleteMemory = async () => {
    if (!selectedMemory) return;
    
    try {
      const { error } = await supabase
        .from('coach_memories')
        .delete()
        .eq('id', selectedMemory.id);

      if (error) throw error;
      
      // Update local state
      const updatedMemories = memories.filter(m => m.id !== selectedMemory.id);
      setMemories(updatedMemories);
      updateMemoryQuota(updatedMemories.length);
      setShowDeleteConfirm(false);
      setSelectedMemory(null);
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const saveMemoryEdits = async () => {
    if (!selectedMemory) return;
    
    try {
      const { error } = await supabase
        .from('coach_memories')
        .update({
          user_notes: editedNotes,
          summary: editedSummary,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedMemory.id);

      if (error) throw error;
      
      // Update local state
      setMemories(memories.map(m => 
        m.id === selectedMemory.id 
          ? { ...m, user_notes: editedNotes, summary: editedSummary, updated_at: new Date().toISOString() } 
          : m
      ));
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const handleGenerateSummaries = async () => {
    if (!user) return;
    
    setIsGeneratingSummaries(true);
    
    try {
      console.log('Automatically generating summaries in the background...');
      const result = await updateMemorySummaries(user.id);
      
      if (result.success && result.updatedCount > 0) {
        console.log(`Successfully generated summaries for ${result.updatedCount} memories`);
        // Refresh memories to show the new summaries
        await fetchMemories(user.id);
      }
    } catch (error) {
      console.error('Error generating summaries:', error);
    } finally {
      setIsGeneratingSummaries(false);
    }
  };

  const handlePersonalizeSummaries = async () => {
    if (!user) return;
    
    setIsPersonalizingSummaries(true);
    
    try {
      console.log('Automatically personalizing summaries in the background...');
      const result = await updateExistingSummariesWithName(user.id);
      
      if (result.success && result.updatedCount > 0) {
        console.log(`Successfully personalized ${result.updatedCount} memory summaries with user's name`);
        // Refresh memories to show the updated summaries
        await fetchMemories(user.id);
      }
    } catch (error) {
      console.error('Error personalizing summaries:', error);
    } finally {
      setIsPersonalizingSummaries(false);
    }
  };

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = (memory.summary?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (memory.user_notes?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  // Count memories without summaries
  const memoriesWithoutSummaries = memories.filter(memory => !memory.summary).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSourceLabel = (memory: MemoryItem) => {
    return memory.source_type === 'journal_entry' ? 'Journal Entry' : 'Chat Message';
  };

  const getImportanceLabel = (importance: number) => {
    switch (importance) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Normal';
    }
  };

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return (
      <div className="p-4">
        <p className="text-red-500">No active session. Please sign in.</p>
        <Link to="/login" className="text-blue-500 hover:underline">
          Go to Login
        </Link>
        {' | '}
        <Link to="/auth/diagnostic" className="text-blue-500 hover:underline">
          Run Authentication Diagnostic
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div>Loading memories...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => fetchMemories(user.id)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="p-4">
        <p>Your coach doesn't have any memories stored yet. Memories are created from your journal entries and chat conversations.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memory Manager</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          {error.includes('authentication') && (
            <div className="mt-2 space-y-2">
              <Link 
                to="/auth-diagnostic" 
                className="text-blue-600 hover:text-blue-800 underline block"
              >
                Run Authentication Diagnostic
              </Link>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 underline block"
              >
                Go to Login Page
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Your Memories</h2>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search memories..."
            className="pl-10 w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Memory quota indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Memory Usage</span>
            <span>{memoryQuota.used} / {memoryQuota.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                memoryQuota.used >= memoryQuota.total 
                  ? 'bg-red-500' 
                  : memoryQuota.used >= memoryQuota.total * 0.9 
                    ? 'bg-yellow-500' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${Math.min((memoryQuota.used / memoryQuota.total) * 100, 100)}%` }}
            ></div>
          </div>
          {memoryQuota.used >= memoryQuota.total && (
            <p className="text-xs text-red-500 mt-1">
              Memory limit reached. Please delete some memories to make room for new ones.
            </p>
          )}
          {memoryQuota.used >= memoryQuota.total * 0.9 && memoryQuota.used < memoryQuota.total && (
            <p className="text-xs text-yellow-500 mt-1">
              Approaching memory limit. Consider deleting old memories.
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">Loading memories...</div>
        ) : error ? (
          <div className="text-red-500 py-4">{error}</div>
        ) : memories.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800">No Memories Found</h3>
            <p className="text-yellow-700">Your coach doesn't have any memories stored yet. Memories are created from your journal entries and chat conversations.</p>
            <div className="mt-4">
              <Link to="/journal" className="text-blue-500 hover:underline">Create a Journal Entry</Link>
              {' or '}
              <Link to="/coach" className="text-blue-500 hover:underline">Start a Chat</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="border rounded-lg p-4 shadow hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(memory.created_at)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {getSourceLabel(memory)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {memory.is_pinned && (
                      <Bookmark className="w-4 h-4 text-yellow-500" />
                    )}
                    <button
                      onClick={() => {
                        setSelectedMemory(memory);
                        setEditMode(true);
                        setEditedNotes(memory.user_notes || '');
                        setEditedSummary(memory.summary || '');
                      }}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMemory(memory);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {memory.summary ? (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
                    <p className="text-gray-800">{memory.summary}</p>
                  </div>
                ) : (
                  <div className="mb-3 text-yellow-600 text-sm">
                    No summary available
                  </div>
                )}

                {memory.user_notes && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
                    <p className="text-gray-600 text-sm">{memory.user_notes}</p>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                  <span>Importance: {getImportanceLabel(memory.importance)}</span>
                  <button
                    onClick={() => togglePin(memory)}
                    className="text-gray-500 hover:text-yellow-500"
                  >
                    <Bookmark className={`w-4 h-4 ${memory.is_pinned ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Edit Modal */}
        {selectedMemory && editMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h3 className="text-lg font-semibold mb-4">Edit Memory</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary
                </label>
                <textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setSelectedMemory(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMemoryEdits}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={deleteMemory}
          title="Delete Memory"
          message="Are you sure you want to delete this memory? This action cannot be undone."
        />
      </div>
    </div>
  );
} 