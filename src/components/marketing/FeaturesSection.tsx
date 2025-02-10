import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Mic, Brain, Sparkles, MessageSquare, 
  LineChart, Shield, Clock, Heart,
  Lightbulb, Zap, Fingerprint, Layers, Star
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: "Voice Journaling",
    description: "Speak your thoughts naturally with our advanced voice-to-text technology",
    details: ["Emotion detection in voice", "Auto-punctuation", "Hands-free journaling"]
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Uncover patterns and insights from your daily reflections",
    details: ["Pattern recognition", "Emotional tracking", "Personal growth metrics"]
  },
  {
    icon: MessageSquare,
    title: "AI Life Coach",
    description: "Get personalized guidance and support 24/7",
    details: ["Contextual responses", "Growth-focused dialogue", "Custom action plans"]
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Enterprise-grade encryption keeps your thoughts secure",
    details: ["End-to-end encryption", "Local processing", "Data sovereignty"]
  },
  {
    icon: Lightbulb,
    title: "Smart Prompts",
    description: "Get inspired with contextual journaling prompts",
    details: ["Mood-based suggestions", "Growth challenges", "Reflection topics"]
  },
  {
    icon: Layers,
    title: "Rich Insights",
    description: "Multi-layered analysis of your personal growth",
    details: ["Thought patterns", "Behavioral trends", "Value alignment"]
  },
  {
    icon: Star,
    title: "Guided Reflection",
    description: "Thoughtful prompts and questions to help you explore your thoughts and feelings more deeply."
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    description: "Transform your daily reflections into actionable insights for continuous personal development."
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