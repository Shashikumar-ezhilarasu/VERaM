import { useState, useRef, useCallback, useEffect } from 'react';

export function useMicCapture(onAudioData: (buffer: ArrayBuffer) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);

  // Keep a stable reference to the latest onAudioData callback to prevent stale closures.
  const onAudioDataRef = useRef(onAudioData);
  useEffect(() => {
    onAudioDataRef.current = onAudioData;
  }, [onAudioData]);

  const emitPcm16 = useCallback((floatBuffer: Float32Array) => {
    const int16Buffer = new Int16Array(floatBuffer.length);
    for (let i = 0; i < floatBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, floatBuffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    onAudioDataRef.current(int16Buffer.buffer);
  }, []);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
      });
      
      mediaStreamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      silentGain.connect(audioCtx.destination);
      silentGainRef.current = silentGain;

      try {
        await audioCtx.audioWorklet.addModule('/pcm-worklet.js');
        const worklet = new AudioWorkletNode(audioCtx, 'pcm-worklet');
        worklet.port.onmessage = (event) => {
          onAudioDataRef.current(event.data);
        };
        workletRef.current = worklet;
        analyser.connect(worklet);
        worklet.connect(silentGain);
      } catch (workletErr) {
        // Fallback for browsers/environments where AudioWorklet module loading is flaky.
        console.warn('AudioWorklet unavailable, using ScriptProcessor fallback.', workletErr);
        const processor = audioCtx.createScriptProcessor(2048, 1, 1);
        processor.onaudioprocess = (event) => {
          const input = event.inputBuffer.getChannelData(0);
          emitPcm16(input);
        };
        scriptProcessorRef.current = processor;
        analyser.connect(processor);
        processor.connect(silentGain);
      }

      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      throw err;
    }
  }, [emitPcm16]);

  const stopCapture = useCallback(() => {
    if (workletRef.current) {
      workletRef.current.port.onmessage = null;
      workletRef.current.disconnect();
      workletRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (silentGainRef.current) {
      silentGainRef.current.disconnect();
      silentGainRef.current = null;
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

  const muteCapture = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => {
        t.enabled = false;
      });
    }
  }, []);

  const getAnalyser = useCallback(() => {
    return analyserRef.current;
  }, []);

  return { isRecording, startCapture, stopCapture, muteCapture, getAnalyser };
}
