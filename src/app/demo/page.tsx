"use client";

import React, { useEffect } from 'react';
import { useVoiceSocket } from '@/lib/ws/useVoiceSocket';
import { useMicCapture } from '@/lib/audio/useMicCapture';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';
import { ConnectionStatusDot } from '@/components/voice/ConnectionStatusDot';
import { LatencyBadges } from '@/components/voice/LatencyBadges';
import { MicButton } from '@/components/voice/MicButton';
import { TranscriptPanel, AnswerPanel } from '@/components/voice/TranscriptPanel';

export default function DemoPage() {
  const { status: wsStatus, connect, send, close } = useVoiceSocket();
  const store = useVoiceSessionStore();
  
  const handleAudioData = React.useCallback((buffer: ArrayBuffer) => {
    // Send binary PCM16 data directly
    if (wsStatus === 'connected') {
      send(buffer);
    }
  }, [send, wsStatus]);

  const { startCapture, stopCapture, getAnalyser } = useMicCapture(handleAudioData);

  useEffect(() => {
    connect();
    return () => close();
  }, [connect, close]);

  const handleStart = async () => {
    store.resetSession();
    store.setStatus('requesting_mic');
    try {
      await startCapture();
      store.setStatus('recording');
      send({ type: "start_session", sampleRate: 16000, encoding: "pcm16", lang: "auto" });
    } catch (err) {
      store.setError("Mic permission denied");
    }
  };

  const handleStop = () => {
    stopCapture();
    send({ type: "end_utterance" });
    // Keep socket open, switch state to waiting
    if (store.status === 'recording') {
      store.setStatus('awaiting_response');
    }
  };

  return (
    <main className="min-h-screen bg-forest flex items-center justify-center p-4 md:p-8">
      <div className="bg-cream rounded-[2rem] p-8 md:p-12 max-w-3xl w-full shadow-2xl relative border-4 border-ink-green">
        <div className="absolute top-6 right-6">
          <ConnectionStatusDot status={wsStatus} onReconnect={connect} />
        </div>
        
        <div className="text-center mb-12 mt-4">
          <p className="text-accent-pink font-mono tracking-[0.2em] text-xs font-bold mb-4">LIVE CONSOLE</p>
          <h1 className="text-4xl md:text-5xl font-serif text-ink-green leading-tight">Ask Anything</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px]">
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
