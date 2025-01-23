import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Clock, Star } from 'lucide-react';
import { MemoryInsight, Memory } from '../../lib/memory/types';

interface MemoryPatternViewProps {
  insight: MemoryInsight;
  onMemoryClick: (memory: Memory) => void;
}

export function MemoryPatternView({ insight, onMemoryClick }: MemoryPatternViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{insight.category}</h3>
            <p className="text-sm text-gray-500">
              Confidence: {Math.round(insight.confidence * 100)}%
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          Updated {new Date(insight.last_updated).toLocaleDateString()}
        </div>
      </div>

      {/* Established Patterns */}
      {insight.patterns.established.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700">
            <Star className="w-4 h-4" />
            Established Patterns
          </div>
          {insight.patterns.established.map(memory => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onMemoryClick(memory)}
              className="p-3 bg-purple-50 rounded-lg cursor-pointer"
            >
              <p className="text-sm text-gray-800">{memory.fact}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-purple-600 font-medium">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recurring Patterns */}
      {insight.patterns.recurring.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
            <Zap className="w-4 h-4" />
            Recurring Patterns
          </div>
          {insight.patterns.recurring.map(memory => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onMemoryClick(memory)}
              className="p-3 bg-blue-50 rounded-lg cursor-pointer"
            >
              <p className="text-sm text-gray-800">{memory.fact}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-blue-600 font-medium">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Emerging Patterns */}
      {insight.patterns.emerging.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Emerging Patterns
          </div>
          {insight.patterns.emerging.map(memory => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onMemoryClick(memory)}
              className="p-3 bg-gray-50 rounded-lg cursor-pointer"
            >
              <p className="text-sm text-gray-800">{memory.fact}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">
                  {Math.round(memory.confidence * 100)}% confidence
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 