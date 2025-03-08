import React from 'react';
import { Heart, Shield, Sparkles } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'User-Centered',
    description: 'Every feature is designed with your personal growth journey in mind.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your thoughts are yours alone. We ensure your journal stays private and secure.'
  },
  {
    icon: Sparkles,
    title: 'Continuous Innovation',
    description: 'We constantly evolve our AI technology to provide deeper, more meaningful insights.'
  }
];

export function AboutSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#6C63FF]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8A6AFD]/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#8A6AFD]">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At InnerMaps, we're on a relentless hunt to uncover the hidden patterns trapping you in cycles of "why do I keep doing this?" By merging AI-powered journaling with psychological insight, we decode your thoughts, expose self-sabotage, and arm you with the clarity to rewrite your story. This isn't just self-reflection—it's a rebellion against repetition. Your journal holds the secrets. We extract them. You break free.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="p-6 bg-white rounded-2xl shadow-sm"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#8A6AFD] flex items-center justify-center text-white">
                <value.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 