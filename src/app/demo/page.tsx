"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useVoiceSocket } from '@/lib/ws/useVoiceSocket';
import { useMicCapture } from '@/lib/audio/useMicCapture';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';
import { ConnectionStatusDot } from '@/components/voice/ConnectionStatusDot';
import { LatencyBadges } from '@/components/voice/LatencyBadges';
import { MicButton } from '@/components/voice/MicButton';
import { TranscriptPanel, AnswerPanel } from '@/components/voice/TranscriptPanel';

export default function DemoPage() {
  const store = useVoiceSessionStore();
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const answerTextRef = useRef('');
  const ttsChunksRef = useRef<Uint8Array[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const ensurePlaybackContext = useCallback(async () => {
    if (!playbackCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      playbackCtxRef.current = new AudioCtx();
    }

    if (playbackCtxRef.current.state === 'suspended') {
      await playbackCtxRef.current.resume();
    }

    return playbackCtxRef.current;
  }, []);

  const speakFallback = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Strip markdown to prevent TTS from reading "asterisk"
    const cleanedText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '');

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'hi-IN';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const clearPlayback = useCallback(() => {
    ttsChunksRef.current = [];
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.src = '';
    }
    activeAudioRef.current = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const handleAudioChunk = useCallback((data: ArrayBuffer) => {
    ttsChunksRef.current.push(new Uint8Array(data));
  }, []);

  const playBufferedAudio = useCallback(async () => {
    const chunks = ttsChunksRef.current;
    if (!chunks.length) {
      speakFallback(answerTextRef.current);
      return;
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const merged = new Uint8Array(totalLength);

    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    ttsChunksRef.current = [];

    const audioBlob = new Blob([merged], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    activeAudioRef.current = audio;
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
      }
    };

    try {
      await audio.play();
    } catch {
      URL.revokeObjectURL(audioUrl);
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
      }
      speakFallback(answerTextRef.current);
    }
  }, [speakFallback]);

  const handleAudioComplete = useCallback(() => {
    void playBufferedAudio();
  }, [playBufferedAudio]);

  const { status: wsStatus, connect, send, close } = useVoiceSocket({
    lang: 'hi-IN',
    onAudioChunk: handleAudioChunk,
    onAudioInterrupt: clearPlayback,
    onAudioComplete: handleAudioComplete,
  });
  
  const handleAudioData = useCallback((buffer: ArrayBuffer) => {
    // Rely on the socket's internal readyState check in `send` instead of React state
    send(buffer);
  }, [send]);

  const { startCapture, stopCapture, muteCapture, getAnalyser } = useMicCapture(handleAudioData);

  useEffect(() => {
    answerTextRef.current = store.answerText;
  }, [store.answerText]);

  useEffect(() => {
    connect();
    return () => {
      close();
      stopCapture();
      clearPlayback();
      if (playbackCtxRef.current) {
        void playbackCtxRef.current.close();
        playbackCtxRef.current = null;
      }
    };
  }, [clearPlayback, close, connect, stopCapture]);

  const handleStart = async () => {
    console.log("MicButton clicked: handleStart");
    store.resetSession();
    store.setStatus('requesting_mic');
    clearPlayback();
    try {
      await ensurePlaybackContext();
      console.log("Playback context ensured");
      await startCapture();
      console.log("Capture started");
      store.setStatus('recording');
    } catch (e: any) {
      console.error("Mic start failed", e);
      alert(`Could not start microphone: ${e?.message || 'Unknown error'}`);
      store.setError("Mic permission denied");
    }
  };

  const handleStop = () => {
    // Mute the mic tracks to stream true silence to the STT, 
    // forcing the backend VAD to endpoint the transcription naturally.
    muteCapture();
    if (store.status === 'recording') {
      store.setStatus('awaiting_response');
      // Fully shut down the hardware microphone after 1 second 
      // to let the silence propagate to the backend.
      setTimeout(() => stopCapture(), 1000);
    } else {
      stopCapture();
    }
  };

  return (
    <main className="min-h-screen bg-forest flex items-center justify-center p-4 md:p-8">
      <div className="bg-cream rounded-4xl p-8 md:p-12 max-w-3xl w-full shadow-2xl relative border-4 border-ink-green">
        <div className="absolute top-6 right-6">
          <ConnectionStatusDot status={wsStatus} onReconnect={connect} />
        </div>
        
        <div className="text-center mb-12 mt-4">
          <p className="text-accent-pink font-mono tracking-[0.2em] text-xs font-bold mb-4">LIVE CONSOLE</p>
          <h1 className="text-4xl md:text-5xl font-serif text-ink-green leading-tight">Ask Anything</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-75">
          <MicButton 
            onStart={handleStart} 
            onStop={handleStop} 
            analyser={getAnalyser()} 
          />
          
          <TranscriptPanel />
          <AnswerPanel />
          
          <div className="mt-8">
            <LatencyBadges />
          </div>
        </div>
      </div>
    </main>
  );
}
