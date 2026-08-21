import { useState, useRef, useCallback } from 'react';

export function useMicCapture(onAudioData: (buffer: ArrayBuffer) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });
      
      mediaStreamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      await audioCtx.audioWorklet.addModule('/pcm-worklet.js');

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const worklet = new AudioWorkletNode(audioCtx, 'pcm-worklet');
      worklet.port.onmessage = (event) => {
        onAudioData(event.data);
      };
      workletRef.current = worklet;

      source.connect(analyser);
      analyser.connect(worklet);
      
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      worklet.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      throw err;
    }
  }, [onAudioData]);

  const stopCapture = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.onmessage = null;
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const getAnalyser = useCallback(() => {
    return analyserRef.current;
  }, []);

  return { isRecording, startCapture, stopCapture, getAnalyser };
}
