import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Sparkles, MessageSquare, Brain, 
  Target, Compass, Star,
  FileText, LineChart,
  Mic, Pause, Play,
  LucideIcon, ChevronRight, ChevronLeft, Search
} from 'lucide-react';
import { JournalAnalytics } from './AppShowcase/JournalAnalytics';
import { Link } from 'react-router-dom';

type WaveformData = number[];

interface JournalEntry {
  time: string;
  icon: LucideIcon;
  type: 'voice' | 'chat' | 'analysis';
  content?: string;
  mood?: string;
  duration?: string;
  waveform?: WaveformData;
  conversation?: Array<{ role: 'user' | 'ai'; text: string }>;
  content_analysis?: {
    sections: Array<{
      icon: LucideIcon;
      title: string;
      text: string;
    }>;
    entryCount: string;
  };
}

const generateWaveform = (length: number): WaveformData => {
  return Array.from({ length }, () => 0.1 + Math.random() * 0.8);
};

const journeyEntries: JournalEntry[] = [
  {
    time: "Morning Voice Journal",
    icon: Mic,
    type: "voice",
    content: `I need to talk about what happened yesterday... I completely lost it during the team meeting. Third time this month I've felt overwhelmed like this. The workload keeps piling up, and I'm constantly checking emails even during dinner with family.

I'm starting to realize I'm not really present anymore - not at work, not at home. Last night, my kid asked me to play, and I said 'in 5 minutes' while checking Slack... but those 5 minutes turned into an hour. The look of disappointment on their face... it really hit me hard.

Everyone keeps saying how 'productive' and 'dedicated' I am, but at what cost? I'm first to log in, last to log off, but I don't feel accomplished. Just tired. Really tired. Maybe being the 'always available' person isn't something to be proud of. I need to find a better way to work and live.`,
    mood: "Overwhelmed & Reflective",
    duration: "3:12",
    waveform: generateWaveform(100)
  },
  {
    time: "Afternoon Coaching Session",
    icon: MessageSquare,
    type: "chat",
    conversation: [
      { 
        role: 'user', 
        text: "I've been thinking about my morning journal. This constant need to be available and productive is affecting my relationships, especially with my family." 
      },
      { 
        role: 'ai', 
        text: "That's a profound realization. When you think about being 'always available', what are you afraid might happen if you weren't?" 
      },
      { 
        role: 'user', 
        text: "I guess I'm afraid of being seen as less committed, or maybe missing out on opportunities. But I'm also missing out on life right now..." 
      },
      { 
        role: 'ai', 
        text: "You're touching on an important paradox - in trying to be available for everything, we can end up not being truly present for anything. What would 'success' look like if you redefined it?" 
      },
      { 
        role: 'user', 
        text: "Success would be feeling accomplished at work without sacrificing my personal life. Being present with my family without guilt. Having clear boundaries." 
      },
      { 
        role: 'ai', 
        text: "That's a powerful vision. It's interesting that you mentioned boundaries - they often feel limiting but actually create space for what matters most. What's one small boundary you could experiment with?" 
      }
    ],
    mood: "Introspective"
  },
  {
    time: "Evening Journal Entry",
    icon: FileText,
    type: "analysis",
    content_analysis: {
      sections: [
        {
          icon: Brain,
          title: "Thought Patterns",
          text: "Equating constant availability with success; struggling with work-life boundaries and digital overwhelm"
        },
        {
          icon: Target,
          title: "Growth Areas",
          text: "Developing healthy boundaries, practicing mindful presence, and redefining personal success metrics"
        },
        {
          icon: Compass,
          title: "Core Values",
          text: "Family connection, meaningful work impact, and sustainable personal growth"
        },
        {
          icon: Star,
          title: "Strengths",
          text: "Self-aware, dedicated to growth, willing to challenge assumptions and make positive changes"
        }
      ],
      entryCount: "6 entries"
    }
  }
];

interface DemoStep {
  id: number;
  title: string;
  description: string;
  preview: React.ReactNode;
}

export function DemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Smart Journaling",
      description: "Record your thoughts with rich text formatting, track your mood, and use voice-to-text for effortless journaling",
      preview: (
        <div className="relative h-full w-full bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Journal Entry</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-emerald-600">Mood: Reflective</span>
                <span className="text-sm text-blue-600">Format: Voice</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-3">Real-time transcription:</div>
            <div className="bg-gray-50 p-4 rounded-xl">
              "I'm realizing that my best decisions come when I take time to reflect. Today's meeting was different because I prepared by reviewing my past insights..."
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              {Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-12 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full opacity-50 animate-pulse"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    height: `${Math.sin(index * 0.5) * 24 + 24}px`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Intelligent Coach Chat",
      description: "Get personalized guidance from our AI coach that remembers your journal entries and provides context-aware support",
      preview: (
        <div className="h-full w-full bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Coach Chat</h3>
              <p className="text-sm text-gray-500">Personalized guidance</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none p-3 max-w-[80%]">
                <p className="text-sm">I've been working 60-hour weeks trying to prove myself, but lately I feel disconnected from everything that matters - my relationships, my health, even my sense of purpose.</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                <p className="text-sm">I notice in your journal entries from last week that you mentioned feeling overwhelmed at work. That disconnect between external success and inner fulfillment is something many high-achievers face. What would it mean to you to feel truly successful?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none p-3 max-w-[80%]">
                <p className="text-sm">I've never really thought about it that way... I guess true success would be feeling like I'm growing as a person, not just in my career.</p>
              </div>
            </div>
            <div className="flex">
              <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                <p className="text-sm">This is a powerful realization. What small step could you take this week to align your daily choices with this deeper definition of success?</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Memory Management",
      description: "AI automatically extracts insights from your journal entries and conversations, creating memories you can organize and search",
      preview: (
        <div className="h-full w-full bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Memory Manager</h3>
              <p className="text-sm text-emerald-600">28 memories generated</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Memories</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work-life balance concerns</span>
                  <div className="flex gap-2">
                    <button className="p-1 rounded bg-blue-100 text-blue-600 text-xs">Pin</button>
                    <button className="p-1 rounded bg-gray-100 text-gray-600 text-xs">Archive</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Career growth reflections</span>
                  <div className="flex gap-2">
                    <button className="p-1 rounded bg-blue-100 text-blue-600 text-xs">Pin</button>
                    <button className="p-1 rounded bg-gray-100 text-gray-600 text-xs">Archive</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Family time priorities</span>
                  <div className="flex gap-2">
                    <button className="p-1 rounded bg-blue-100 text-blue-600 text-xs">Pin</button>
                    <button className="p-1 rounded bg-gray-100 text-gray-600 text-xs">Archive</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Memory Search</h4>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search memories..." 
                  className="w-full p-2 pl-8 border rounded-lg text-sm"
                />
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500">
                Memory quota: 28/150 used
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div className="w-[18%] h-full bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, demoSteps.length]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    setIsPlaying(false);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + demoSteps.length) % demoSteps.length);
    setIsPlaying(false);
  };

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 right-0 w-96 h-96 bg-primary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-48 left-0 w-96 h-96 bg-secondary-light/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 bg-primary-light/10 rounded-full text-primary mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">See It In Action</span>
          </motion.div>
          
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Experience Inner Growth
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how our AI-powered journaling platform helps you unlock deeper self-understanding
          </p>
        </div>

        <div className="relative">
          <div className="aspect-[16/9] max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-3xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full p-8"
                >
                  <div className="grid md:grid-cols-2 gap-8 h-full">
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl font-bold mb-4 gradient-text">
                        {demoSteps[currentStep].title}
                      </h3>
                      <p className="text-gray-600 mb-8">
                        {demoSteps[currentStep].description}
                      </p>
                    </div>
                    <div className="relative h-full">
                      {demoSteps[currentStep].preview}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute left-0 right-0 bottom-4 flex justify-center items-center gap-4">
            <button
              onClick={prevStep}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-gray-600" />
              ) : (
                <Play className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <button
              onClick={nextStep}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="absolute -bottom-12 left-0 right-0">
            <div className="flex justify-center items-center gap-2">
              {demoSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => {
                    setCurrentStep(index);
                    setIsPlaying(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentStep === index
                      ? 'w-8 bg-blue-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 