import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Sparkles, MessageSquare, Brain, 
  Target, Compass, Star,
  FileText, LineChart,
  Mic, Pause, Play,
  LucideIcon
} from 'lucide-react';
import { JournalAnalytics } from './AppShowcase/JournalAnalytics';

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

export function DemoSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const renderContent = (entry: JournalEntry) => {
    switch (entry.type) {
      case 'voice':
        if (!entry.waveform || !entry.content || !entry.duration) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Voice Journal</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{entry.duration}</span>
                <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative h-24 bg-gray-50 rounded-lg p-4">
              <div className="absolute inset-0 flex items-center justify-between px-4">
                {entry.waveform.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full"
                    style={{ 
                      height: `${height * 100}%`,
                      opacity: 0.7 + (height * 0.3)
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Transcript</span>
              </div>
              <p className="text-gray-600 whitespace-pre-line">{entry.content}</p>
            </div>
          </div>
        );

      case 'chat':
        if (!entry.conversation) return null;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">AI Coach</span>
            </div>
            {entry.conversation.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        );

      case 'analysis':
        if (!entry.content_analysis) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Your Patterns & Insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <span>{entry.content_analysis.entryCount}</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {entry.content_analysis.sections.map((section, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <section.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{section.title}</h4>
                      <p className="text-gray-600 text-sm">{section.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
    >
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 rounded-full text-blue-600 mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Your Journey</span>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Experience Personal Growth
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          See how InnerMaps helps you track your journey and uncover insights
        </p>
      </div>

      <div className="space-y-8">
        {journeyEntries.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            {renderContent(entry)}
          </motion.div>
        ))}

        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: journeyEntries.length * 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <LineChart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium">Analytics Dashboard</span>
          </div>
          <JournalAnalytics />
        </motion.div>
      </div>
    </motion.div>
  );
} 