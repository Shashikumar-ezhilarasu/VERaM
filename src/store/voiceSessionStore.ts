import { create } from 'zustand';


export interface QueryMetrics {
  id: string;
  timestamp: number;
  sttLatencyMs: number | null;
  retrievalLatencyMs: number | null;
  llmLatencyMs: number | null;
  ttsLatencyMs: number | null;
  totalLatencyMs: number | null;
  transcript?: string;
  declined?: boolean;
}

export interface CompletedResponse {
  answerText: string;
  metrics: QueryMetrics;
}

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

  // Connection and System State
  isOnline: boolean;
  isBackendWaking: boolean;
  
  // History for Metrics
  metricsHistory: Array<{ sttMs: number; retrievalMs: number; generationMs: number; totalMs: number }>;
  responses: CompletedResponse[];
  
  // Audio Quality
  audioSignalLevel: number;

  
  // Audio playback state
  isAudioPlaying: boolean;
  isAudioPaused: boolean;
  hasAudioData: boolean;

  audioCurrentTime: number;
  audioDuration: number;
  micPermissionError: boolean;

  
  setStatus: (status: VoiceSessionStatus) => void;
  setError: (msg: string) => void;
  appendPartialTranscript: (text: string) => void;
  setFinalTranscript: (text: string) => void;
  appendAnswerToken: (token: string) => void;
  setAnswerDone: (text: string) => void;
  setLatencyMetrics: (metrics: VoiceSessionState['latencyMetrics']) => void;
  setGuardrailBlocked: (reason: string) => void;
  
  
  setSystemState: (state: Partial<{ isOnline: boolean; isBackendWaking: boolean; audioSignalLevel: number }>) => void;

  commitResponse: () => void;
  setAudioState: (state: { currentTime?: number; duration?: number; micError?: boolean; isPlaying?: boolean; isPaused?: boolean; hasData?: boolean }) => void;
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

  isOnline: true,
  isBackendWaking: false,
  metricsHistory: [],
  responses: [],
  audioSignalLevel: 0,

  isAudioPlaying: false,
  isAudioPaused: false,
  hasAudioData: false,
    audioCurrentTime: 0,
    audioDuration: 0,
    micPermissionError: false,

  setStatus: (status) => set({ status }),
  setError: (errorMessage) => set({ status: 'error', errorMessage }),
  appendPartialTranscript: (text) => set({ transcriptPartial: text }),
  setFinalTranscript: (text) => set({ transcriptFinal: text, transcriptPartial: '' }),
  appendAnswerToken: (token) => set((state) => ({ answerText: state.answerText + token })),
  setAnswerDone: (text) => set({ answerText: text }),
  
  setLatencyMetrics: (metrics) => set((state) => ({ 
    latencyMetrics: metrics,
    metricsHistory: metrics ? [...state.metricsHistory, metrics].slice(-10) : state.metricsHistory
  })),

  setGuardrailBlocked: (reason) => set({ guardrailBlocked: reason }),
  
  
  setSystemState: (state) => set((prev) => ({ ...prev, ...state })),

  setAudioState: (state) => set((prev) => ({
    isAudioPlaying: state.isPlaying !== undefined ? state.isPlaying : prev.isAudioPlaying,
    isAudioPaused: state.isPaused !== undefined ? state.isPaused : prev.isAudioPaused,
    hasAudioData: state.hasData !== undefined ? state.hasData : prev.hasAudioData,

    audioCurrentTime: state.currentTime !== undefined ? state.currentTime : prev.audioCurrentTime,
    audioDuration: state.duration !== undefined ? state.duration : prev.audioDuration,
    micPermissionError: state.micError !== undefined ? state.micError : prev.micPermissionError,

  })),


  commitResponse: () => set((state) => {
    if (!state.answerText && !state.guardrailBlocked) return state; // Nothing to commit
    
    // Avoid double committing the exact same final state
    const last = state.responses[0];
    if (last && last.metrics.transcript === state.transcriptFinal && last.answerText === state.answerText) return state;

    const metrics: QueryMetrics = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sttLatencyMs: state.latencyMetrics?.sttMs ?? null,
      retrievalLatencyMs: state.latencyMetrics?.retrievalMs ?? null,
      llmLatencyMs: state.latencyMetrics?.generationMs ?? null,
      ttsLatencyMs: null,
      totalLatencyMs: state.latencyMetrics?.totalMs ?? null,
      transcript: state.transcriptFinal,
      declined: !!state.guardrailBlocked,
    };
    
    const newResponse: CompletedResponse = {
      answerText: state.answerText,
      metrics
    };
    
    return {
      responses: [newResponse, ...state.responses]
    };
  }),

  resetSession: () => set((state) => ({
    status: 'idle',
    errorMessage: null,
    transcriptPartial: '',
    transcriptFinal: '',
    answerText: '',
    latencyMetrics: null,
    guardrailBlocked: null,

    isOnline: state.isOnline,
    isBackendWaking: false,
    metricsHistory: state.metricsHistory,
    responses: state.responses,
    audioSignalLevel: 0,

    isAudioPlaying: false,
    isAudioPaused: false,
    hasAudioData: false,
  }))
}));
