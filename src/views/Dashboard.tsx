import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Send, Settings, Loader2, Sparkles, Menu, X, Trash2, BookOpen, Flame, Search } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { analyzeJournalEntry, saveJournalEntry, deleteJournalEntry } from '../lib/deepseek';
import { Link, useLocation } from 'react-router-dom';
import { VoiceRecorder } from '../components/VoiceRecorder/VoiceRecorder';
import { supabase } from '../lib/supabase';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { saveMood, getMoodHistory, type Mood } from '../lib/moods';

type Tab = 'analysis' | 'chat';

const WRITING_PROMPTS = [
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
];

interface Analysis {
  emotionalPatterns: string;
  keyThemes: string;
  suggestions: string;
}

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  mood?: Mood;
  mood_intensity?: number;
  energy_level?: number;
}

interface User {
  current_streak: number;
  longest_streak: number;
  total_entries: number;
  // ... other user fields
}

interface MoodSelection {
  mood: Mood;
  intensity: number;
  energyLevel: number;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [entry, setEntry] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [showPrompts, setShowPrompts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; entryId: string | null }>({
    isOpen: false,
    entryId: null
  });
  const [selectedMood, setSelectedMood] = useState<MoodSelection | null>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{ mood: Mood; created_at: string }>>([]);
  const [moodFilter, setMoodFilter] = useState<'all' | 'positive' | 'challenging' | 'energy'>('all');

  const location = useLocation();

  useEffect(() => {
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

        const processedEntries = entries?.map(entry => ({
          ...entry,
          mood: entry.journal_moods?.[0]?.mood,
          mood_intensity: entry.journal_moods?.[0]?.intensity,
          energy_level: entry.journal_moods?.[0]?.energy_level
        })) || [];

        setPastEntries(processedEntries);
      } catch (error) {
        console.error('Error in checkAuthAndFetchEntries:', error);
      }
    };

    checkAuthAndFetchEntries();
  }, []); // Only run once on mount

  useEffect(() => {
    const loadStreakAndMoods = async () => {
      const moodData = await getMoodHistory();
      if (moodData) {
        setMoodHistory(moodData);
      }
    };

    loadStreakAndMoods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || isAnalyzing) return;
    
    if (!selectedMood) {
      alert("Please select how you're feeling before saving your entry.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const savedEntry = await saveJournalEntry(entry);
      
      if (savedEntry) {
        await saveMood(
          selectedMood.mood,
          savedEntry.id,
          selectedMood.intensity,
          selectedMood.energyLevel
        );

        setPastEntries(current => [{
          ...savedEntry,
          mood: selectedMood.mood,
          mood_intensity: selectedMood.intensity,
          energy_level: selectedMood.energyLevel
        }, ...current]);
        
        setEntry('');
        setSelectedMood(null);
      }
    } catch (error: any) {
      console.error('Failed to save entry:', error);
      alert(error.message || 'Error saving entry. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setEntry(prev => prev ? `${prev}\n\n${prompt}` : prompt);
    setShowPrompts(false);
  };

  const handleTranscription = (text: string) => {
    setEntry(prev => prev ? `${prev}\n\n${text}` : text);
  };

  const handleLiveTranscription = (text: string) => {
    // Filter out common filler words
    const fillerWords = ['you', 'um', 'uh', 'ah'];
    const cleanedText = text.split(' ')
      .filter(word => !fillerWords.includes(word.toLowerCase()))
      .join(' ');

    if (!cleanedText) return; // Don't update if only filler words were detected

    setEntry(prev => {
      const textarea = document.querySelector('textarea');
      if (textarea && textarea.selectionStart === textarea.selectionEnd) {
        const position = textarea.selectionStart;
        return prev.slice(0, position) + ' ' + cleanedText + prev.slice(position);
      }
      return prev ? `${prev} ${cleanedText}` : cleanedText;
    });
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteDialog({ isOpen: true, entryId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.entryId) return;
    
    try {
      setDeletingId(deleteDialog.entryId);
      
      const success = await deleteJournalEntry(deleteDialog.entryId);
      
      if (success) {
        // Update local state
        setPastEntries(current => 
          current.filter(entry => entry.id !== deleteDialog.entryId)
        );
        setDeleteDialog({ isOpen: false, entryId: null });
      }
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      alert(error.message || 'Error deleting entry. Please try again.');
    } finally {
      setDeletingId(null);
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

  const WritingStats = ({ entries }: { entries: JournalEntry[] }) => {
    const totalWords = entries.reduce((acc, entry) => {
      // Split by whitespace and filter out empty strings
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

  const getFilteredEntries = () => {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <MoodSelector />

        {/* Journal Entry Section */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-8 mb-8 transition-all duration-200 hover:shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Today's Entry</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#4461F2] hover:bg-blue-50/80 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100"
            >
              <Sparkles className="w-4 h-4" />
              Writing Prompts
            </button>
          </div>

          {showPrompts && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
              {WRITING_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-4 text-left text-sm text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-blue-50/80 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-md border border-gray-100 hover:border-blue-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent pointer-events-none rounded-xl" />
            <div className="relative">
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full min-h-[200px] p-6 border-2 border-gray-100 rounded-xl focus:border-[#4461F2] focus:ring-[#4461F2] resize-none text-gray-700 leading-relaxed transition-all duration-200 hover:border-gray-200 placeholder:text-gray-400 bg-white/80"
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <div className="text-sm text-gray-400 bg-white/80 px-2 py-1 rounded-lg">
                  {entry.length} characters
                </div>
                <VoiceRecorder 
                  onTranscription={handleTranscription}
                  onLiveTranscription={handleLiveTranscription}
                  disabled={isAnalyzing}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !entry.trim() || !selectedMood}
                  className={`
                    px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md 
                    disabled:hover:shadow-none flex items-center gap-2 hover:scale-[1.02]
                    ${!selectedMood 
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-not-allowed'
                      : 'bg-[#4461F2] text-white hover:bg-blue-700'
                    }
                    disabled:opacity-50
                  `}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : !selectedMood ? (
                    <>
                      <span>Select Mood First</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Save Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Past Entries Section */}
        <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-8 mb-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Your Journey</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {moodFilter === 'all' 
                    ? 'Reflecting on your emotional path'
                    : `Showing ${moodFilter} emotions`
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={moodFilter}
                  onChange={(e) => setMoodFilter(e.target.value as typeof moodFilter)}
                  className={`
                    px-3 py-2 rounded-lg border transition-all focus:outline-none 
                    focus:ring-2 focus:ring-blue-200 cursor-pointer text-sm
                    ${getMoodFilterStyles(moodFilter)}
                  `}
                >
                  <option value="all">All Moods</option>
                  <option value="positive">Positive Moods</option>
                  <option value="challenging">Challenging Moods</option>
                  <option value="energy">Energy States</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {getFilteredEntries().length === 0 ? (
                <div className="text-center py-8 bg-white/80 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">No entries found</h3>
                  <p className="text-gray-500 text-sm">
                    {moodFilter === 'all' 
                      ? "You haven't written any entries yet"
                      : `No entries with ${moodFilter} moods found`
                    }
                  </p>
                </div>
              ) : (
                getFilteredEntries().map((entry) => (
                  <div 
                    key={entry.id} 
                    className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  >
                    {/* Entry Header - Reorganized */}
                    <div className="space-y-4 mb-4 pb-4 border-b border-gray-100">
                      {/* Date and Delete Button */}
                      <div className="flex justify-between items-start">
                        <time className="flex flex-col">
                          <span className="text-base font-medium text-gray-900">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </time>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 
                            transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete entry"
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Mood Display */}
                      {entry.mood && (
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl w-fit">
                          <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                            {getMoodEmoji(entry.mood)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{entry.mood}</span>
                            <div className="flex gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1" title="Intensity Level">
                                <span>🎯</span>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${(entry.mood_intensity || 0) * 20}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-1" title="Energy Level">
                                <span>⚡</span>
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-500 rounded-full"
                                    style={{ width: `${(entry.energy_level || 0) * 20}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rest of the entry card remains the same */}
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
        </div>

        <WritingStats entries={getFilteredEntries()} />
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