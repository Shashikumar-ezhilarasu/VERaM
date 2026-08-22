import React, { useEffect, useRef } from 'react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';
import { DashedCircle } from '../ui/DashedCircle';
import { Mic, Loader2, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';

interface MicButtonProps {
  onStart: () => void;
  onStop: () => void;
  analyser?: AnalyserNode | null;
  countdown?: number | null;
}

export function MicButton({ onStart, onStop, analyser, countdown }: MicButtonProps) {
  const status = useVoiceSessionStore(state => state.status);
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'recording' && analyser && ringRef.current) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Map average volume (0-255) to a scale (1.0 - 1.3)
        const scale = 1 + (average / 255) * 0.3;
        
        gsap.to(ringRef.current, { scale, duration: 0.1, ease: 'power2.out' });
        
        rafRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gsap.to(ringRef.current, { scale: 1, duration: 0.3 });
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, analyser]);

  // Spin animation for connecting/processing states
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (status === 'awaiting_response' || status === 'streaming_answer') {
        gsap.to(ringRef.current, { rotation: "+=360", duration: 2, repeat: -1, ease: "linear" });
      } else {
        gsap.killTweensOf(ringRef.current, "rotation");
      }
    }, ringRef);
    return () => ctx.revert();
  }, [status]);

  const isIdle = status === 'idle' || status === 'done';
  const isRecording = status === 'recording';
  const isProcessing = status === 'awaiting_response' || status === 'streaming_answer';
  const isError = status === 'error';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-32 h-32 mb-4">
        <div ref={ringRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <DashedCircle size={140} className={isError ? "text-hhgoa-pink stroke-current" : "text-hhgoa-green stroke-current opacity-30"} />
        </div>
        
        <button 
          onClick={isRecording ? onStop : onStart}
          disabled={status === 'requesting_mic' || isProcessing}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors shadow-[4px_4px_0_rgba(0,0,0,0.2)]
            ${isError ? 'bg-hhgoa-pink text-white outline-dashed outline-2 outline-offset-4 outline-hhgoa-pink' : 
              isRecording ? 'bg-hhgoa-pink text-white outline-dashed outline-2 outline-offset-4 outline-hhgoa-pink animate-pulse' :
              'bg-hhgoa-yellow text-hhgoa-green hover:bg-hhgoa-cream outline-dashed outline-2 outline-offset-4 outline-hhgoa-green'}
            ${(status === 'requesting_mic' || isProcessing) ? 'opacity-70 cursor-wait bg-hhgoa-cream text-hhgoa-green' : 'cursor-pointer'}
          `}
        >
          {status === 'requesting_mic' || isProcessing ? (
            <Loader2 size={36} className="animate-spin" />
          ) : isError ? (
            <AlertCircle size={36} />
          ) : (
            <Mic size={36} />
          )}
        </button>
      </div>

      <p className="font-mono text-xs tracking-widest uppercase h-4 font-bold transition-colors">
        {isIdle && <span className="text-hhgoa-green/60">Tap to ask</span>}
        {status === 'requesting_mic' && <span className="text-hhgoa-green/60">Allow Mic...</span>}
        {isRecording && !countdown && <span className="text-hhgoa-pink animate-pulse">Listening...</span>}
        {isRecording && countdown && (
           <span className="text-hhgoa-pink animate-ping">Stopping in {countdown}...</span>
        )}
        {isProcessing && <span className="text-hhgoa-yellow">Thinking...</span>}
        {isError && <span className="text-red-500">Error</span>}
      </p>
    </div>
  );
}
