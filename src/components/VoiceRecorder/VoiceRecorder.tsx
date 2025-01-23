import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onLiveTranscription?: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ 
  onTranscription, 
  onLiveTranscription,
  disabled 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      stopRecording();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(permission.state);
      permission.addEventListener('change', () => {
        setPermissionStatus(permission.state);
      });
    } catch (error) {
      console.error('Error checking microphone permission:', error);
    }
  };

  const transcribeChunk = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      const extension = audioBlob.type.includes('mp3') ? 'mp3' : 'webm';
      formData.append('file', audioBlob, `chunk.${extension}`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('prompt', currentTranscript);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.text?.trim()) {
        const newText = data.text.trim();
        setCurrentTranscript(prev => prev + ' ' + newText);
        onLiveTranscription?.(newText);
      }
    } catch (error) {
      console.error('Chunk transcription error:', error);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setCurrentTranscript('');
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/mp3') 
        ? 'audio/mp3' 
        : 'audio/webm;codecs=opus';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      let transcriptionInProgress = false;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          
          // Only start new transcription if previous one is complete
          if (!transcriptionInProgress) {
            transcriptionInProgress = true;
            await transcribeChunk(e.data);
            transcriptionInProgress = false;
          }
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          await transcribeAudio(audioBlob);
        } finally {
          stream.getTracks().forEach(track => track.stop());
          setCurrentTranscript('');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500); // Record in 500ms chunks
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      setError(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Please allow microphone access to use voice recording'
          : 'Unable to start recording. Please try again.'
      );
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      const extension = audioBlob.type.includes('mp3') ? 'mp3' : 'webm';
      formData.append('file', audioBlob, `audio.${extension}`);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Transcription failed');
      }

      const data = await response.json();
      if (data.text) {
        onTranscription(data.text);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
      chunksRef.current = [];
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isTranscribing}
        className={`p-2 rounded-full transition-all duration-200 ${
          isRecording 
            ? 'bg-red-100 text-red-600 animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isTranscribing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <Square className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isRecording && !currentTranscript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
            Recording...
          </span>
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-600">
          Please enable microphone access in your browser settings
        </div>
      )}
    </div>
  );
} 