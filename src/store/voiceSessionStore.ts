import { create } from 'zustand';

export type VoiceSessionStatus = 
  | 'idle' 
  | 'requesting_mic' 
  | 'recording' 
  | 'awaiting_response' 
  | 'streaming_answer' 
  | 'done' 
  | 'error';

interface VoiceSessionState {
  status: VoiceSessionStatus;
  errorMessage: string | null;
  transcriptPartial: string;
  transcriptFinal: string;
  answerText: string;
  latencyMetrics: {
    sttMs: number;
    retrievalMs: number;
    generationMs: number;
    totalMs: number;
  } | null;
  guardrailBlocked: string | null;
  
  setStatus: (status: VoiceSessionStatus) => void;
  setError: (msg: string) => void;
  appendPartialTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  appendAnswerToken: (token: string) => void;
  setAnswerDone: (text: string) => void;
  setLatencyMetrics: (metrics: VoiceSessionState['latencyMetrics']) => void;
  setGuardrailBlocked: (reason: string) => void;
  resetSession: () => void;
}

export const useVoiceSessionStore = create<VoiceSessionState>((set) => ({
  status: 'idle',
  errorMessage: null,
  transcriptPartial: '',
  transcriptFinal: '',
  answerText: '',
  latencyMetrics: null,
  guardrailBlocked: null,

  setStatus: (status) => set({ status }),
  setError: (errorMessage) => set({ status: 'error', errorMessage }),
  appendPartialTranscript: (text) => set({ transcriptPartial: text }),
  setFinalTranscript: (text) => set({ transcriptFinal: text, transcriptPartial: '' }),
  appendAnswerToken: (token) => set((state) => ({ answerText: state.answerText + token })),
  setAnswerDone: (text) => set({ answerText: text }),
  setLatencyMetrics: (metrics) => set({ latencyMetrics: metrics }),
  setGuardrailBlocked: (reason) => set({ guardrailBlocked: reason }),
  resetSession: () => set({
    status: 'idle',
    errorMessage: null,
    transcriptPartial: '',
    transcriptFinal: '',
    answerText: '',
    latencyMetrics: null,
    guardrailBlocked: null,
  })
}));
