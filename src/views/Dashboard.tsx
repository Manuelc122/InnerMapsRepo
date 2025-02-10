import React, { useState, useEffect } from 'react';
import { useAuth } from '../state-management/AuthContext';
import { Mic, Send, Settings, Loader2, Sparkles, Menu, X, Trash2, BookOpen, Flame, Search } from 'lucide-react';
import { Logo } from '../components/shared/Logo';
import { saveJournalEntry, deleteJournalEntry } from '../utils/journal';
import { Link, useLocation } from 'react-router-dom';
import { VoiceRecorder } from '../components/VoiceRecorder/VoiceRecorder';
import { supabase } from '../utils/supabaseClient';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { saveMood, getMoodHistory, type Mood } from '../utils/moods';

type Tab = 'analysis' | 'chat';
type MoodFilterType = 'all' | 'positive' | 'challenging' | 'energy';

const WRITING_PROMPTS: readonly string[] = [
  // Daily Reflection
  "Today, I noticed that...",
  "The most meaningful part of my day was...",
  "Something that challenged me today was...",
  "A small win I want to celebrate is...",
  "Right now, my body feels... and my mind feels...",

  // Emotional Exploration
  "Dear Journal, lately I've been feeling...",
  "When I sit quietly with myself, I notice...",
  "The emotion I'm carrying most heavily today is...",
  "If my feelings could speak, they would say...",
  "Today's mood feels like (weather/color/season) because...",

  // Self-Discovery
  "Dear Future Self, I want you to know...",
  "When I look back at who I was a year ago...",
  "Something I'm learning about myself is...",
  "A pattern I've noticed in my life recently...",
  "The story I keep telling myself is...",

  // Growth & Healing
  "I'm ready to let go of...",
  "A boundary I need to set is...",
  "Dear Inner Child, what you need to know is...",
  "I'm learning to accept...",
  "I want to give myself permission to...",

  // Relationships & Connections
  "In my relationships, I notice that I...",
  "The people who make me feel most like myself are...",
  "A conversation I need to have is...",
  "Something I wish others understood about me is...",
  "My relationship with myself has been...",

  // Dreams & Aspirations
  "If I could change one thing right now...",
  "A small step I can take today toward my dreams is...",
  "Something I want to explore more deeply is...",
  "I feel most alive when...",
  "A new possibility I'm opening up to is...",

  // Gratitude & Joy
  "Three tiny moments of joy today were...",
  "Something unexpected that made me smile was...",
  "I'm grateful for these simple pleasures...",
  "A recent moment of connection that touched me...",
  "Today, I appreciated...",

  // Challenges & Growth
  "Dear Journal, I'm struggling with...",
  "What's really underneath this feeling is...",
  "A challenge that's actually teaching me...",
  "I'm learning to be gentle with myself about...",
  "The support I need right now is...",

  // Wisdom & Insights
  "A lesson life keeps teaching me is...",
  "Something I know now that I didn't before...",
  "My inner wisdom is telling me...",
  "A truth I'm finally ready to face is...",
  "Looking back, I understand that...",

  // Present Moment
  "Right here, right now...",
  "Today, I'm making space for...",
  "In this moment, I choose...",
  "My body is telling me...",
  "The little things I noticed today...",

  // Inner Dialogue
  "The conversation I need to have with myself is...",
  "If I could tell my younger self one thing...",
  "The part of me that needs attention right now...",
  "I want to acknowledge that I...",
  "A truth I've been avoiding is...",

  // Personal Power
  "I feel strongest when...",
  "A small way I can honor my needs today...",
  "I'm learning to trust myself about...",
  "My intuition is guiding me to...",
  "I'm ready to reclaim...",

  // Healing & Release
  "Dear Past Self, I want you to know...",
  "I'm ready to rewrite the story of...",
  "A weight I'm ready to put down is...",
  "I forgive myself for...",
  "Today, I choose to release...",

  // Future Vision
  "The version of myself I'm growing into...",
  "A new chapter I'm beginning is...",
  "I'm planting these seeds for my future...",
  "The change I'm nurturing is...",
  "Small steps I'm taking toward...",

  // Integration
  "Mind, body, and spirit - today I feel...",
  "The balance I'm seeking is...",
  "When I listen deeply, I hear...",
  "Today's experience taught me...",
  "I'm learning to integrate..."
] as const;

interface JournalEntry {
  readonly id: string;
  readonly content: string;
  readonly created_at: string;
  readonly mood?: Mood;
  readonly mood_intensity?: number;
  readonly energy_level?: number;
}

interface User {
  current_streak: number;
  longest_streak: number;
  total_entries: number;
  // ... other user fields
}

interface MoodSelection {
  readonly mood: Mood;
  readonly intensity: number;
  readonly energyLevel: number;
}

interface DeleteDialogState {
  readonly isOpen: boolean;
  readonly entryId: string | null;
}

interface MoodHistoryEntry {
  readonly mood: Mood;
  readonly created_at: string;
}

interface WritingStatsProps {
  entries: readonly JournalEntry[];
}

const WritingStats = ({ entries }: WritingStatsProps) => {
  const totalWords = entries.reduce((acc, entry) => {
    const words = entry.content.trim().split(/\s+/).filter(word => word.length > 0);
    return acc + words.length;
  }, 0);
  
  const averageWords = entries.length > 0 ? Math.floor(totalWords / entries.length) : 0;
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white/90 rounded-xl p-4 text-center">
        <p className="text-2xl font-semibold text-blue-600">{entries.length}</p>
        <p className="text-sm text-gray-500">Total Entries</p>
      </div>
      <div className="bg-white/90 rounded-xl p-4 text-center">
        <p className="text-2xl font-semibold text-purple-600">{totalWords}</p>
        <p className="text-sm text-gray-500">Words Written</p>
      </div>
      <div className="bg-white/90 rounded-xl p-4 text-center">
        <p className="text-2xl font-semibold text-green-600">{averageWords}</p>
        <p className="text-sm text-gray-500">Avg. Words/Entry</p>
      </div>
    </div>
  );
};

export function Dashboard() {
  const { user } = useAuth();
  const [entry, setEntry] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showPrompts, setShowPrompts] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [pastEntries, setPastEntries] = useState<readonly JournalEntry[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    entryId: null
  });
  const [selectedMood, setSelectedMood] = useState<MoodSelection | null>(null);
  const [moodHistory, setMoodHistory] = useState<readonly MoodHistoryEntry[]>([]);
  const [moodFilter, setMoodFilter] = useState<MoodFilterType>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const location = useLocation();

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
        .select(`
          *,
          journal_moods (
            mood,
            intensity,
            energy_level
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
      }

      const processedEntries = (entries ?? []).map(entry => ({
        ...entry,
        mood: entry.journal_moods?.[0]?.mood,
        mood_intensity: entry.journal_moods?.[0]?.intensity,
        energy_level: entry.journal_moods?.[0]?.energy_level
      }));

      setPastEntries(processedEntries);
    } catch (error) {
      console.error('Error in checkAuthAndFetchEntries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;

    setIsSaving(true);
    try {
      const savedEntry = await saveJournalEntry(entry);
      
      if (selectedMood && savedEntry?.id) {
        await saveMood(
          selectedMood.mood,
          savedEntry.id,
          selectedMood.intensity,
          selectedMood.energyLevel
        );
      }
      
      setEntry('');
      setSelectedMood(null);
      await checkAuthAndFetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setEntry(prev => prev + (prev ? '\n\n' : '') + prompt);
    setShowPrompts(false);
  };

  const handleTranscription = (text: string) => {
    setEntry(prev => prev + (prev ? ' ' : '') + text);
  };

  const handleLiveTranscription = (text: string) => {
    setEntry(prev => {
      const parts = prev.split('...');
      return parts[0] + text;
    });
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteDialog({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.entryId) return;

    try {
      await deleteJournalEntry(deleteDialog.entryId);
      await checkAuthAndFetchEntries();
      setDeleteDialog({ isOpen: false, entryId: null });
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const MoodSelector = () => {
    const moodCategories = [
      {
        category: "Positive",
        description: "Feeling good? That's worth celebrating! 🎉",
        moods: [
          { emoji: "😊", label: "Happy", color: "bg-gradient-to-br from-yellow-100 to-orange-100" },
          { emoji: "😌", label: "Calm", color: "bg-gradient-to-br from-blue-100 to-cyan-100" },
          { emoji: "🥰", label: "Loved", color: "bg-gradient-to-br from-pink-100 to-rose-100" },
          { emoji: "✨", label: "Inspired", color: "bg-gradient-to-br from-purple-100 to-indigo-100" },
          { emoji: "💪", label: "Confident", color: "bg-gradient-to-br from-emerald-100 to-green-100" },
          { emoji: "🌟", label: "Grateful", color: "bg-gradient-to-br from-amber-100 to-yellow-100" },
        ]
      },
      {
        category: "Challenging",
        description: "It's okay not to be okay. Your feelings matter. 💙",
        moods: [
          { emoji: "😔", label: "Sad", color: "bg-gradient-to-br from-blue-100 to-indigo-100" },
          { emoji: "😤", label: "Frustrated", color: "bg-gradient-to-br from-red-100 to-rose-100" },
          { emoji: "😰", label: "Anxious", color: "bg-gradient-to-br from-orange-100 to-amber-100" },
          { emoji: "😢", label: "Hurt", color: "bg-gradient-to-br from-violet-100 to-purple-100" },
          { emoji: "😩", label: "Overwhelmed", color: "bg-gradient-to-br from-fuchsia-100 to-pink-100" },
          { emoji: "😕", label: "Confused", color: "bg-gradient-to-br from-slate-100 to-gray-100" },
        ]
      },
      {
        category: "Energy",
        description: "How's your energy level today? ⚡",
        moods: [
          { emoji: "⚡", label: "Energetic", color: "bg-gradient-to-br from-yellow-100 to-amber-100" },
          { emoji: "😌", label: "Relaxed", color: "bg-gradient-to-br from-blue-100 to-sky-100" },
          { emoji: "😴", label: "Tired", color: "bg-gradient-to-br from-gray-100 to-slate-100" },
          { emoji: "💪", label: "Strong", color: "bg-gradient-to-br from-emerald-100 to-green-100" },
          { emoji: "🤒", label: "Unwell", color: "bg-gradient-to-br from-red-100 to-rose-100" },
          { emoji: "😫", label: "Exhausted", color: "bg-gradient-to-br from-purple-100 to-indigo-100" },
        ]
      }
    ];

    return (
      <div className="mb-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900">How are you feeling?</h3>
          <p className="text-gray-500 flex items-center justify-center gap-1">
            <span className="text-red-500">*</span>
            Select your mood before writing your journal entry
          </p>
        </div>

        {/* Add a visual progress indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`
            w-3 h-3 rounded-full 
            ${selectedMood ? 'bg-green-500' : 'bg-gray-300'}
          `} />
          <span className={selectedMood ? 'text-green-600' : 'text-gray-500'}>
            {selectedMood ? 'Mood selected' : 'Select your mood'}
          </span>
        </div>

        <div className="space-y-8">
          {moodCategories.map((category, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-1">{category.category}</h4>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {category.moods.map(({ emoji, label, color }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedMood(prev => ({
                      mood: label as Mood,
                      intensity: prev?.intensity || 3,
                      energyLevel: prev?.energyLevel || 3
                    }))}
                    className={`
                      relative group p-4 rounded-xl transition-all duration-300
                      ${selectedMood?.mood === label 
                        ? `${color} ring-2 ring-blue-500 shadow-lg scale-105` 
                        : `${color} hover:scale-105 hover:shadow-md`
                      }
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-2 transform transition-transform group-hover:scale-110">
                        {emoji}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {selectedMood && (
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-100 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How intense is this feeling?
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={selectedMood.intensity}
                      onChange={(e) => setSelectedMood(prev => ({
                        ...prev!,
                        intensity: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Very Mild</span>
                      <span>Moderate</span>
                      <span>Very Strong</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level
                  </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={selectedMood.energyLevel}
                      onChange={(e) => setSelectedMood(prev => ({
                        ...prev!,
                        energyLevel: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 accent-green-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Low Energy</span>
                      <span>Balanced</span>
                      <span>High Energy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getMoodEmoji = (mood: Mood): string => {
    const moodEmojis: Record<Mood, string> = {
      'Happy': '😊',
      'Calm': '😌',
      'Loved': '🥰',
      'Inspired': '✨',
      'Confident': '💪',
      'Grateful': '🌟',
      'Sad': '😔',
      'Frustrated': '😤',
      'Anxious': '😰',
      'Hurt': '😢',
      'Overwhelmed': '😩',
      'Confused': '😕',
      'Tired': '😴',
      'Energetic': '⚡',
      'Unwell': '🤒',
      'Strong': '💪',
      'Relaxed': '😌',
      'Exhausted': '😫'
    };
    return moodEmojis[mood] || '';
  };

  const getMoodCategory = (mood: Mood): 'positive' | 'challenging' | 'energy' => {
    const categories = {
      positive: ['Happy', 'Calm', 'Loved', 'Inspired', 'Confident', 'Grateful'],
      challenging: ['Sad', 'Frustrated', 'Anxious', 'Hurt', 'Overwhelmed', 'Confused'],
      energy: ['Tired', 'Energetic', 'Unwell', 'Strong', 'Relaxed', 'Exhausted']
    };

    if (categories.positive.includes(mood)) return 'positive';
    if (categories.challenging.includes(mood)) return 'challenging';
    return 'energy';
  };

  const getFilteredEntries = (): readonly JournalEntry[] => {
    if (moodFilter === 'all') return pastEntries;
    
    return pastEntries.filter(entry => 
      entry.mood && getMoodCategory(entry.mood) === moodFilter
    );
  };

  const getMoodFilterStyles = (filter: typeof moodFilter) => {
    switch (filter) {
      case 'positive':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'challenging':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'energy':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      default:
        return 'bg-white/80 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <MoodSelector />

        {/* Journal Entry Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-40 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4461F2] resize-none"
                disabled={isSaving}
              />
              {isSaving && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#4461F2]" />
                    <span className="text-gray-600">Saving your entry...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="p-2 text-gray-500 hover:text-[#4461F2] hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className="p-2 text-gray-500 hover:text-[#4461F2] hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!entry.trim() || isSaving || !selectedMood}
                className="px-6 py-2 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Save Entry
              </button>
            </div>
          </form>
        </div>

        {/* Past Entries Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text">Your Journal Entries</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {(['all', 'positive', 'challenging', 'energy'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setMoodFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      moodFilter === filter
                        ? 'bg-[#4461F2] text-white border-[#4461F2]'
                        : getMoodFilterStyles(filter)
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {getFilteredEntries().length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#4461F2] to-[#7E87FF] rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                <p className="text-gray-600">Start writing to begin your journaling journey</p>
              </div>
            ) : (
              getFilteredEntries().map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4461F2] to-[#7E87FF] flex items-center justify-center text-white">
                        {entry.mood && getMoodEmoji(entry.mood)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {entry.mood && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#4461F2]">
                              Feeling {entry.mood}
                            </span>
                            {entry.mood_intensity && (
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-gray-500">
                                  Intensity: {entry.mood_intensity}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteDialog({ isOpen: true, entryId: entry.id })}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none" />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <span className="text-xs text-gray-400">
                      {entry.content.trim().split(/\s+/).filter(word => word.length > 0).length} words
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, entryId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
      />
    </div>
  );
} 