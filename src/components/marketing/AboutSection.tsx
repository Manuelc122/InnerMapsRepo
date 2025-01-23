import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Heart, Shield, 
  Target, Globe
} from 'lucide-react';

const missionPoints = [
  {
    icon: Heart,
    title: "Personal Growth for Everyone",
    description: "We believe everyone deserves access to powerful tools for self-discovery and emotional intelligence.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Shield,
    title: "Privacy as a Foundation",
    description: "Your thoughts are sacred. We've built our platform with uncompromising privacy and security.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: Target,
    title: "AI for Good",
    description: "Using advanced technology not to replace human connection, but to deepen our understanding of ourselves.",
    color: "from-green-500 to-emerald-500"
  }
];

export function AboutSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Mission Statement */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 rounded-full text-blue-600 mb-4"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">Our Mission</span>
        </motion.div>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Empowering Personal Growth Through Technology
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're building the future of self-discovery and emotional intelligence, 
          making powerful AI-driven tools accessible to everyone.
        </p>
      </div>

      {/* Mission Points */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        {missionPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.2 }
            } : {}}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity rounded-xl duration-500"
                 style={{ backgroundImage: `linear-gradient(to right, ${point.color})` }} />
            <div className="relative bg-white rounded-xl p-8 shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${point.color} mb-4`}>
                  <point.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {point.title}
                </h3>
                <p className="text-gray-600">
                  {point.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Team Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <blockquote className="text-2xl text-gray-600 italic max-w-4xl mx-auto">
          "We envision a world where everyone has access to the tools and insights 
          they need for meaningful personal growth and emotional well-being."
        </blockquote>
        <div className="mt-4 text-gray-500">
          — The InnerMaps Team
        </div>
      </motion.div>
    </motion.div>
  );
} 