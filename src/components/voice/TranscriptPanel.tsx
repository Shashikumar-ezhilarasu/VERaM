import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';

export function TranscriptPanel() {
  const { transcriptPartial, transcriptFinal, status, answerText } = useVoiceSessionStore();

  
  if (status === 'done' && !transcriptFinal && !transcriptPartial && !answerText) {
    return (
      <div className="w-full text-center mt-6">
        <p className="font-serif text-xl text-hhgoa-green/50 italic">
          Didn&apos;t catch that, try again.
        </p>
      </div>
    );
  }

  if (!transcriptPartial && !transcriptFinal) return null;

  return (
    <div className="w-full text-center mt-6">
      <p className="font-serif text-2xl text-hhgoa-green">
        {transcriptFinal ? (
          <span>{transcriptFinal}</span>
        ) : (
          <span className="opacity-70 italic">{transcriptPartial}</span>
        )}
      </p>
    </div>
  );
}

export function AnswerPanel({ onPlay, onPause, onReplay }: { onPlay?: () => void, onPause?: () => void, onReplay?: () => void }) {
  const { answerText, guardrailBlocked, status, isAudioPlaying, isAudioPaused, hasAudioData } = useVoiceSessionStore();

  if (guardrailBlocked) {
    return (
      <div className="w-full mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="font-mono text-red-600 text-sm font-bold mb-2">GUARDRAIL BLOCKED</p>
        <p className="font-serif text-red-800">{guardrailBlocked}</p>
      </div>
    );
  }

  if (!answerText && status !== 'streaming_answer' && status !== 'done') return null;

  const cleanedText = answerText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '');

  return (
    <div className="w-full mt-8 p-6 bg-white/5 border border-white/10 rounded-none relative">
      <div className="flex justify-between items-center mb-4">
        <p className="font-mono text-xs tracking-[0.2em] text-hhgoa-green uppercase">Answer</p>
        
        {/* Playback Controls */}
        {hasAudioData && status === 'done' && (
          <div className="flex gap-2">
            {isAudioPlaying ? (
              <button onClick={onPause} className="p-2 rounded-full bg-hhgoa-green/10 text-hhgoa-green hover:bg-hhgoa-green hover:text-hhgoa-white transition-colors">
                <Pause size={16} />
              </button>
            ) : (
              <button onClick={onPlay} className="p-2 rounded-full bg-hhgoa-green/10 text-hhgoa-green hover:bg-hhgoa-green hover:text-hhgoa-white transition-colors">
                <Play size={16} />
              </button>
            )}
            <button onClick={onReplay} className="p-2 rounded-full bg-hhgoa-green/10 text-hhgoa-green hover:bg-hhgoa-green hover:text-hhgoa-white transition-colors">
              <RotateCcw size={16} />
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-hhgoa-green leading-relaxed text-sm whitespace-pre-wrap text-left">
        {cleanedText}
        {status === 'streaming_answer' && <span className="inline-block w-2 h-4 ml-1 bg-hhgoa-green animate-pulse" />}
      </p>
    </div>
  );
}
