import React, { useState } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { AudioVisualizer } from './AudioRecorder/AudioVisualizer';
import { formatTime } from '../utils/audio';

interface JournalEditorProps {
  onSubmit: (content: string) => void;
}

export function JournalEditor({ onSubmit }: JournalEditorProps) {
  const [content, setContent] = useState('');
  const { 
    isRecording,
    audioData,
    recordingTime,
    interimTranscript,
    finalTranscript,
    startRecording,
    stopRecording
  } = useAudioRecording();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleStopRecording = () => {
    const transcript = stopRecording();
    if (transcript) {
      const newContent = content.trim() 
        ? `${content}\n\n${transcript}` 
        : transcript;
      setContent(newContent);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Today's Entry</h2>
              <p className="text-sm text-gray-500">{currentDate}</p>
            </div>
            {isRecording && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-red-50 text-red-600 rounded-full animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-600" />
                <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Editor Area */}
          <div className="relative min-h-[400px] p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind today?"
              className="w-full h-full min-h-[360px] bg-transparent text-gray-700 placeholder-gray-400 text-lg resize-none focus:outline-none"
            />
            
            {/* Recording Feedback */}
            {isRecording && interimTranscript && (
              <div className="absolute bottom-20 right-6 max-w-sm p-3 bg-blue-50 rounded-lg shadow-sm animate-fade-in">
                <p className="text-sm text-gray-600">
                  {finalTranscript}
                  <span className="text-gray-400">{interimTranscript}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Square className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Save
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}