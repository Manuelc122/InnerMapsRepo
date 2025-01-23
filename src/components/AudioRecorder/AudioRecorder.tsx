import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useAudioRecording } from '../../hooks/useAudioRecording';
import { AudioVisualizer } from './AudioVisualizer';
import { formatTime } from '../../utils/audio';

interface AudioRecorderProps {
  onRecordingComplete: (text: string) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const { 
    isRecording,
    audioData,
    recordingTime,
    interimTranscript,
    finalTranscript,
    startRecording,
    stopRecording
  } = useAudioRecording();

  const handleStopRecording = () => {
    const transcript = stopRecording();
    if (transcript) {
      onRecordingComplete(transcript);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        {isRecording ? (
          <button
            onClick={handleStopRecording}
            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Stop recording"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            title="Start recording"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3">
            <AudioVisualizer audioData={audioData} />
            <span className="text-sm text-gray-500">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {isRecording && (interimTranscript || finalTranscript) && (
        <div className="max-w-md p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {finalTranscript}
            <span className="text-gray-400">{interimTranscript}</span>
          </p>
        </div>
      )}
    </div>
  );
}