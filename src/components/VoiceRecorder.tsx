import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X } from 'lucide-react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      cleanup(); // Ensure any previous recording is cleaned up
      lastTranscriptRef.current = ''; // Reset the transcript

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Set language explicitly
      
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          const newTranscript = transcript.trim();
          if (newTranscript !== lastTranscriptRef.current) {
            lastTranscriptRef.current = newTranscript;
            onTranscriptionComplete(newTranscript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
        stopRecording();
      };

      recognition.onend = () => {
        // Restart recognition if we're still recording
        if (isRecording && recognitionRef.current) {
          recognitionRef.current.start();
        }
      };

      recognition.start();

      // Start duration timer
      let duration = 0;
      timerRef.current = setInterval(() => {
        duration += 0.1;
        setRecordingDuration(duration);
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
      cleanup();
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    cleanup();
    setIsRecording(false);
    setRecordingDuration(0);

    // Clean up audio tracks
    const tracks = mediaRecorderRef.current.stream.getTracks();
    tracks.forEach(track => track.stop());
  };

  return (
    <div className="relative">
      <button
        type="button" // Prevent form submission
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          p-3 rounded-full transition-all duration-200 flex items-center justify-center
          ${isRecording 
            ? 'bg-red-500 scale-110' 
            : 'bg-gradient-to-r from-[#4461F2] to-[#7E87FF] hover:opacity-90'
          }
        `}
      >
        <Mic className={`w-5 h-5 ${isRecording ? 'text-white animate-pulse' : 'text-white'}`} />
      </button>
      
      {isRecording && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md">
          {recordingDuration.toFixed(1)}s
        </div>
      )}
    </div>
  );
} 