import { useState, useRef, useCallback, useEffect } from 'react';
import { setupSpeechRecognition } from '../utils/audio';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    recognition.current = setupSpeechRecognition(
      (text) => setInterimTranscript(text),
      (text) => {
        setFinalTranscript((prev) => prev + ' ' + text);
        setInterimTranscript('');
      }
    );

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyser
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      
      // Configure analyser
      analyser.current.fftSize = 256;
      const bufferLength = analyser.current.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      // Start recording and transcription
      setIsRecording(true);
      setRecordingTime(0);
      setInterimTranscript('');
      setFinalTranscript('');
      recognition.current?.start();

      // Start visualization update
      const updateVisualization = () => {
        if (analyser.current && isRecording) {
          analyser.current.getFloatTimeDomainData(dataArray);
          setAudioData(new Float32Array(dataArray));
          requestAnimationFrame(updateVisualization);
        }
      };
      updateVisualization();

      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setAudioData(null);
    recognition.current?.stop();
    
    // Clean up
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (audioContext.current) {
      audioContext.current.close();
    }

    const transcript = (finalTranscript + ' ' + interimTranscript).trim();
    setInterimTranscript('');
    setFinalTranscript('');
    return transcript;
  }, [finalTranscript, interimTranscript]);

  return {
    isRecording,
    audioData,
    recordingTime,
    interimTranscript,
    finalTranscript,
    startRecording,
    stopRecording
  };
}