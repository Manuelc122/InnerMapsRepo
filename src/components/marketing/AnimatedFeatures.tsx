import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Brain, Sparkles, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: "5-Minute Journal",
    description: "Transform your day with just 5 minutes of focused reflection"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Uncover patterns and insights from your daily entries"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade encryption keeps your thoughts safe"
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    description: "Track your progress and celebrate your journey"
  }
];

export function AnimatedFeatures() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, staggerChildren: 0.2 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 py-16"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: index * 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <feature.icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
} 