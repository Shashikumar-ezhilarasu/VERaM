import React from 'react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';

export function LatencyBadges() {
  const latencyMetrics = useVoiceSessionStore((state) => state.latencyMetrics);

  if (!latencyMetrics) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4 text-xs font-mono">
      <div className="bg-cream px-3 py-1 rounded-full border border-ink-muted/20 flex gap-2">
        <span className="text-ink-muted">STT:</span>
        <span className="text-ink-green font-bold">{latencyMetrics.sttMs}ms</span>
      </div>
      <div className="bg-cream px-3 py-1 rounded-full border border-ink-muted/20 flex gap-2">
        <span className="text-ink-muted">Retrieval:</span>
        <span className="text-ink-green font-bold">{latencyMetrics.retrievalMs}ms</span>
      </div>
      <div className="bg-cream px-3 py-1 rounded-full border border-ink-muted/20 flex gap-2">
        <span className="text-ink-muted">Gen:</span>
        <span className="text-ink-green font-bold">{latencyMetrics.generationMs}ms</span>
      </div>
      <div className="bg-accent-pink-soft text-accent-pink px-3 py-1 rounded-full font-bold flex gap-2">
        <span>Total:</span>
        <span>{latencyMetrics.totalMs}ms</span>
      </div>
    </div>
  );
}
