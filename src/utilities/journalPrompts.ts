import { type LucideIcon, Smile, Heart, Star, Sun, Coffee, BookOpen, Leaf, Moon, Compass, 
  Feather, Music, Mountain, Eye, Brain, Lightbulb, Map, Anchor, Flower2, Sparkles, 
  CloudRain, Flame, Waves, Wind } from 'lucide-react';

export interface JournalPrompt {
  icon: LucideIcon;
  text: string;
  category: string;
}

// Self-Discovery Prompts
const selfDiscoveryPrompts: JournalPrompt[] = [
  {
    icon: Eye,
    text: "What patterns do you notice in your emotional responses lately?",
    category: "Self-Discovery"
  },
  {
    icon: Brain,
    text: "Describe a belief you've recently questioned or changed",
    category: "Growth"
  },
  {
    icon: Heart,
    text: "What boundaries do you need to set or maintain for your well-being?",
    category: "Self-Care"
  },
  {
    icon: Lightbulb,
    text: "What hidden strengths have your challenges revealed?",
    category: "Insights"
  },
  {
    icon: Map,
    text: "How has your definition of success evolved over time?",
    category: "Growth"
  }
];

// Emotional Intelligence Prompts
const emotionalPrompts: JournalPrompt[] = [
  {
    icon: Waves,
    text: "Describe an emotion you're experiencing without naming it",
    category: "Emotions"
  },
  {
    icon: Wind,
    text: "What triggers have you noticed in your emotional responses?",
    category: "Awareness"
  },
  {
    icon: CloudRain,
    text: "How do you typically cope with difficult emotions?",
    category: "Coping"
  },
  {
    icon: Flame,
    text: "What lights you up inside? When do you feel most alive?",
    category: "Passion"
  },
  {
    icon: Anchor,
    text: "What grounds you when you feel overwhelmed?",
    category: "Stability"
  }
];

// Personal Growth Prompts
const growthPrompts: JournalPrompt[] = [
  {
    icon: Flower2, // Changed from Tree to Flower2
    text: "In what ways are you different from a year ago?",
    category: "Growth"
  },
  {
    icon: Sparkles,
    text: "What limiting belief is ready to be released?",
    category: "Liberation"
  },
  {
    icon: Mountain,
    text: "What's the next small step in your personal growth?",
    category: "Progress"
  },
  {
    icon: Compass,
    text: "What values guide your decisions most strongly?",
    category: "Values"
  },
  {
    icon: Star,
    text: "What part of yourself are you ready to embrace more fully?",
    category: "Acceptance"
  }
];

// Mindfulness Prompts
const mindfulnessPrompts: JournalPrompt[] = [
  {
    icon: Sun,
    text: "What sensations are you aware of in your body right now?",
    category: "Present Moment"
  },
  {
    icon: Leaf,
    text: "Describe the quality of your thoughts right now",
    category: "Awareness"
  },
  {
    icon: Moon,
    text: "What brings you back to the present moment?",
    category: "Grounding"
  },
  {
    icon: Music,
    text: "What patterns do you notice in your self-talk?",
    category: "Inner Voice"
  },
  {
    icon: Coffee,
    text: "How do different environments affect your state of mind?",
    category: "Environment"
  }
];

// Writer's Block Prompts
const writersBlockPrompts: JournalPrompt[] = [
  {
    icon: Feather,
    text: "List three things you can see, hear, and feel right now",
    category: "Sensory"
  },
  {
    icon: BookOpen,
    text: "Start with 'I remember...' and let your mind wander",
    category: "Memory"
  },
  {
    icon: Heart,
    text: "What would you write if no one would ever read it?",
    category: "Freedom"
  },
  {
    icon: Smile,
    text: "Describe your current mood as a weather pattern",
    category: "Metaphor"
  },
  {
    icon: Brain,
    text: "What's the first memory that comes to mind? Start there.",
    category: "Starting Point"
  }
];

// Combine all prompts
export const journalPrompts: JournalPrompt[] = [
  ...selfDiscoveryPrompts,
  ...emotionalPrompts,
  ...growthPrompts,
  ...mindfulnessPrompts,
  ...writersBlockPrompts
];