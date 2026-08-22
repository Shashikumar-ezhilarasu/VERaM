
import React from 'react';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';
import { Activity } from 'lucide-react';

export function LatencyBadges() {
  const { latencyMetrics, status, metricsHistory } = useVoiceSessionStore();

  if (status === 'idle' && !latencyMetrics && metricsHistory.length === 0) {
    return (
      <div className="w-full mt-6 bg-hhgoa-green/50 text-hhgoa-cream/50 p-4 border-2 border-hhgoa-green border-dashed relative opacity-50">
        <div className="absolute -top-3 left-4 bg-hhgoa-green text-hhgoa-cream px-2 py-0.5 font-bold text-[10px] tracking-widest uppercase flex items-center gap-1">
          <Activity size={12} />
          Metrics Ready
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-center font-mono">
          <div className="flex flex-col"><span className="text-[10px] uppercase mb-1">STT Engine</span><span className="text-lg">--</span></div>
          <div className="flex flex-col border-l border-hhgoa-green"><span className="text-[10px] uppercase mb-1">Vector DB</span><span className="text-lg">--</span></div>
          <div className="flex flex-col border-l border-hhgoa-green"><span className="text-[10px] uppercase mb-1">Groq LLM</span><span className="text-lg">--</span></div>
          <div className="flex flex-col border-l border-hhgoa-green"><span className="text-[10px] uppercase mb-1">Total E2E</span><span className="text-lg">--</span></div>
        </div>
      </div>
    );
  }

  if (!latencyMetrics) return null;

  // Render actual metrics
  return (
    <div className="w-full mt-6 bg-hhgoa-green text-hhgoa-cream p-4 border-2 border-hhgoa-yellow relative">
      <div className="absolute -top-3 left-4 bg-hhgoa-yellow text-hhgoa-green px-2 py-0.5 font-bold text-[10px] tracking-widest uppercase flex items-center gap-1">
        <Activity size={12} />
        Performance Metrics
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-center font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-hhgoa-cream/70 uppercase tracking-wider mb-1">STT Engine</span>
          <span className="text-lg text-hhgoa-yellow font-black">{latencyMetrics.sttMs}ms</span>
        </div>
        <div className="flex flex-col border-l border-hhgoa-cream/20">
          <span className="text-[10px] text-hhgoa-cream/70 uppercase tracking-wider mb-1">Vector DB</span>
          <span className="text-lg text-hhgoa-yellow font-black">{latencyMetrics.retrievalMs}ms</span>
        </div>
        <div className="flex flex-col border-l border-hhgoa-cream/20">
          <span className="text-[10px] text-hhgoa-cream/70 uppercase tracking-wider mb-1">Groq LLM</span>
          <span className="text-lg text-hhgoa-yellow font-black">{latencyMetrics.generationMs}ms</span>
        </div>
        <div className="flex flex-col border-l border-hhgoa-cream/20 bg-hhgoa-pink/10">
          <span className="text-[10px] text-hhgoa-pink uppercase tracking-wider mb-1 font-bold">Total E2E</span>
          <span className="text-lg text-hhgoa-pink font-black">{latencyMetrics.totalMs}ms</span>
        </div>
      </div>
    </div>
  );
}
