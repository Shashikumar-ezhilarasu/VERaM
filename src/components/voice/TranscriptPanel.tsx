import React from 'react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';

export function TranscriptPanel() {
  const { transcriptPartial, transcriptFinal } = useVoiceSessionStore();

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

export function AnswerPanel() {
  const { answerText, guardrailBlocked, status } = useVoiceSessionStore();

  if (guardrailBlocked) {
    return (
      <div className="w-full mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <p className="font-mono text-red-600 text-sm font-bold mb-2">GUARDRAIL BLOCKED</p>
        <p className="font-serif text-red-800">{guardrailBlocked}</p>
      </div>
    );
  }

  if (!answerText && status !== 'streaming_answer' && status !== 'done') return null;

  // Strip markdown formatting for a cleaner natural language display
  const cleanedText = answerText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '');

  return (
    <div className="w-full mt-8 p-6 bg-white/5 border border-white/10 rounded-none">
      <p className="font-mono text-xs tracking-[0.2em] text-hhgoa-green mb-4 uppercase">Answer</p>
      <p className="font-mono text-hhgoa-green leading-relaxed text-sm whitespace-pre-wrap text-left">
        {cleanedText}
        {status === 'streaming_answer' && <span className="inline-block w-2 h-4 ml-1 bg-hhgoa-green animate-pulse" />}
      </p>
    </div>
  );
}
