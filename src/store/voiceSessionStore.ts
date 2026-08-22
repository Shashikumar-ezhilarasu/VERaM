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

  // Connection and System State
  isOnline: boolean;
  isBackendWaking: boolean;
  
  // History for Metrics
  metricsHistory: Array<{ sttMs: number; retrievalMs: number; generationMs: number; totalMs: number }>;
  
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

  resetSession: () => set({
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
  audioSignalLevel: 0,

  isAudioPlaying: false,
    isAudioPaused: false,
    hasAudioData: false,
  })
}));
