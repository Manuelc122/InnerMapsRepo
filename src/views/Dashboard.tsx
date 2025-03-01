import React, { useState, useEffect } from 'react';
import { useAuth } from '../state-management/AuthContext';
import { Search, Send, Loader2, Trash2 } from 'lucide-react';
import { saveJournalEntry, deleteJournalEntry } from '../utils/journal';
import { supabase } from '../utils/supabaseClient';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useUserName } from '../state-management/UserNameContext';

interface JournalEntry {
  readonly id: string;
  readonly content: string;
  readonly created_at: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const { firstName } = useUserName();
  const [entry, setEntry] = useState<string>('');
  const [pastEntries, setPastEntries] = useState<readonly JournalEntry[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    checkAuthAndFetchEntries();
  }, []);

  const checkAuthAndFetchEntries = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return;
      }

      const { data: entries, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
      }

      setPastEntries(entries || []);
    } catch (error) {
      console.error('Error in checkAuthAndFetchEntries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setIsSaving(true);
    try {
      const { data: newEntry, error } = await saveJournalEntry(entry);
      if (error) throw error;

      setPastEntries(prev => [newEntry, ...prev]);
      setEntry('');
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    try {
      await deleteJournalEntry(selectedEntry.id);
      setPastEntries(prev => prev.filter(e => e.id !== selectedEntry.id));
      setSelectedEntry(null);
      setEntry('');
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredEntries = pastEntries.filter(entry => 
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatDate(entry.created_at).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEntry(entry.content);
  };

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setEntry('');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white/80 backdrop-blur-sm p-6 relative z-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {firstName ? `${firstName}'s Journal` : 'My Journal'}
            </h1>
            <p className="text-sm text-gray-500">Record your daily thoughts</p>
          </div>

          <button
            onClick={handleNewEntry}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow"
          >
            + New Entry
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4461F2] bg-white/50"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Journal Entries</h2>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedEntry?.id === entry.id
                    ? 'bg-[#4461F2]/5 border border-[#4461F2]/20'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(entry.created_at)}
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                {firstName ? `${firstName}'s Entry - ` : ''}
                {selectedEntry ? formatDate(selectedEntry.created_at) : formatDate(new Date().toISOString())}
              </h2>
              {selectedEntry && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <textarea
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder={firstName ? `What's on your mind today, ${firstName}?` : "Write about your day..."}
                  className="w-full h-[calc(100vh-300px)] p-4 bg-white/50 rounded-xl border-0 focus:ring-0 text-gray-700 resize-none"
                  style={{ outline: 'none' }}
                />
                <div className="absolute bottom-4 right-4">
                  <VoiceRecorder 
                    onTranscriptionComplete={(text) => {
                      setEntry(prev => {
                        const prevLines = prev.split('\n');
                        const lastLine = prevLines[prevLines.length - 1]?.trim();
                        
                        if (lastLine === text.trim()) {
                          return prev;
                        }
                        
                        if (!prev.trim()) {
                          return text;
                        }
                        return `${prev.trim()}\n${text}`;
                      });
                    }} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isSaving) return;
                    
                    try {
                      setIsSaving(true);
                      const { data: newEntry, error } = await saveJournalEntry(
                        entry,
                        selectedEntry?.id
                      );
                      
                      if (error) throw error;
                      
                      if (!newEntry) {
                        throw new Error('No entry returned from save operation');
                      }
                      
                      // If we're editing an existing entry, update it in the list
                      if (selectedEntry) {
                        setPastEntries(prev => prev.map(e => 
                          e.id === selectedEntry.id ? newEntry : e
                        ));
                      } else {
                        // If it's a new entry, add it to the list
                        setPastEntries(prev => [newEntry, ...prev]);
                        setEntry('');
                        setSelectedEntry(null);
                      }
                    } catch (error) {
                      console.error('Error saving entry:', error);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className={`
                    px-4 py-2 rounded-xl font-medium text-white transition-all duration-200
                    ${isSaving
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#4461F2] to-[#7E87FF] hover:opacity-90'
                    }
                  `}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>{selectedEntry ? 'Update' : 'Save'}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
      />
    </div>
  );
} 