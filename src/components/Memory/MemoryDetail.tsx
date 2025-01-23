import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Calendar, AlertCircle } from 'lucide-react';
import { Memory } from '../../lib/memory/types';

interface MemoryDetailProps {
  memory: Memory;
  relatedMemories: Memory[];
  onClose: () => void;
}

export function MemoryDetail({ memory, relatedMemories, onClose }: MemoryDetailProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Memory Detail</h3>
                <p className="text-sm text-gray-500">Extracted from journal entry</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Main Memory */}
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-gray-900">{memory.fact}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(memory.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {Math.round(memory.confidence * 100)}% confidence
                  </div>
                </div>
                {memory.context && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-medium">Context:</p>
                    <p>{memory.context}</p>
                  </div>
                )}
              </div>

              {/* Related Memories */}
              {relatedMemories.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Link2 className="w-4 h-4" />
                    Related Memories
                  </div>
                  {relatedMemories.map(related => (
                    <div
                      key={related.id}
                      className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600"
                    >
                      {related.fact}
                      <div className="mt-1 text-xs text-gray-400">
                        {new Date(related.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 