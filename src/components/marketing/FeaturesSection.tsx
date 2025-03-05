import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Mic, Brain, Sparkles, MessageSquare, 
  LineChart, Shield, Clock, Heart,
  Lightbulb, Zap, Fingerprint, Layers, Star,
  PenTool, Search, Archive, Lock
} from 'lucide-react';

const features = [
  {
    icon: PenTool,
    title: "Smart Journaling",
    description: "Record your thoughts with our AI-enhanced journaling system",
    details: ["Rich text formatting", "Mood tracking", "Voice-to-text transcription", "Pattern recognition"]
  },
  {
    icon: MessageSquare,
    title: "Intelligent Coach Chat",
    description: "Get personalized guidance from our AI coach that remembers your history",
    details: ["Context-aware responses", "Memory integration", "Multiple chat sessions", "Markdown support"]
  },
  {
    icon: Brain,
    title: "Memory Management",
    description: "AI automatically extracts insights from your journal entries and conversations",
    details: ["AI-generated memories", "Memory organization", "Semantic search", "Memory quota tracking"]
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Your data is protected with enterprise-grade security",
    details: ["Secure authentication", "Data encryption", "Private journaling", "Complete data ownership"]
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find relevant memories and journal entries based on content similarity",
    details: ["Natural language search", "Context-aware results", "Quick retrieval", "Comprehensive indexing"]
  },
  {
    icon: Archive,
    title: "Memory Organization",
    description: "Organize your AI-generated memories for better insights",
    details: ["Pin important memories", "Archive less relevant ones", "Delete as needed", "Categorization"]
  },
  {
    icon: Lightbulb,
    title: "Personalized Insights",
    description: "Gain deeper understanding of your emotional patterns and thought processes",
    details: ["Emotional pattern recognition", "Behavioral trends", "Growth opportunities", "Self-awareness"]
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    description: "Transform your daily reflections into actionable insights for continuous personal development"
  }
];

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-blue-50/30">
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 rounded-full text-blue-600 mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4 gradient-text">
            Features That Empower Your Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover tools designed to enhance your self-reflection and personal growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              } : {}}
              className="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 