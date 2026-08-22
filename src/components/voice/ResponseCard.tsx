"use client";

import { useState } from "react";
import { QueryMetrics } from "@/store/voiceSessionStore";

interface ResponseCardProps {
  answerText: string;
  metrics: QueryMetrics;
}

function DetailRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between border-b border-dashed border-hhgoa-green/20 py-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-hhgoa-green/70">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-hhgoa-green">{value}</span>
    </div>
  );
}

export function ResponseCard({ answerText, metrics }: ResponseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const cleanedText = answerText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '');

  return (
    <div className="rounded-none border-2 border-dashed border-hhgoa-yellow bg-hhgoa-cream p-5 mb-4 shadow-sm relative">
      {metrics.transcript && (
        <p className="mb-4 font-mono text-xs text-hhgoa-green/60 italic border-l-2 border-hhgoa-green/30 pl-3">
          &ldquo;{metrics.transcript}&rdquo;
        </p>
      )}

      {metrics.declined ? (
        <div className="p-4 bg-hhgoa-pink/10 border border-hhgoa-pink/30 mb-4">
          <p className="font-mono text-xs font-bold text-hhgoa-pink mb-1 uppercase tracking-widest">GUARDRAIL BLOCKED</p>
          <p className="font-serif text-base italic text-hhgoa-pink">
            The system couldn&apos;t find grounded context for this — no answer given
            rather than guessing.
          </p>
        </div>
      ) : (
        <p className="font-mono text-sm text-hhgoa-green leading-relaxed whitespace-pre-wrap">{cleanedText}</p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="font-mono text-xs text-hhgoa-green/60 font-bold bg-hhgoa-green/10 px-2 py-1 rounded">
          {metrics.totalLatencyMs != null ? `${metrics.totalLatencyMs}ms` : "—"}
        </span>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="rounded-full border-2 border-dashed border-hhgoa-pink bg-transparent px-4 py-1.5 font-mono text-xs font-bold text-hhgoa-pink transition-colors hover:bg-hhgoa-pink hover:text-white"
        >
          {expanded ? "Hide details ▲" : "View details ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t-2 border-dashed border-hhgoa-green/20 pt-4">
          <div>
            <h4 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-hhgoa-pink">
              Latency breakdown
            </h4>
            <DetailRow label="STT Engine" value={metrics.sttLatencyMs != null ? `${metrics.sttLatencyMs}ms` : undefined} />
            <DetailRow label="Vector DB" value={metrics.retrievalLatencyMs != null ? `${metrics.retrievalLatencyMs}ms` : undefined} />
            <DetailRow label="Groq LLM" value={metrics.llmLatencyMs != null ? `${metrics.llmLatencyMs}ms` : undefined} />
            <DetailRow label="Total end-to-end" value={metrics.totalLatencyMs != null ? `${metrics.totalLatencyMs}ms` : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
