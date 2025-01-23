import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Mic, Brain, Sparkles, MessageSquare, 
  LineChart, Shield, Clock, Heart,
  Lightbulb, Zap, Fingerprint, Layers
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
  }
];

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-white to-blue-50">
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
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Personal Growth
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced tools for self-discovery, powered by cutting-edge AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { 
                opacity: 1, 
                y: 0,
                transition: { delay: index * 0.1 }
              } : {}}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-1 h-1 bg-blue-600 rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 