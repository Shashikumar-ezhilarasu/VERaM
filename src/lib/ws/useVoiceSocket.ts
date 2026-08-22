import { useState, useCallback, useRef } from 'react';
import { BackendJsonEvent } from './protocol';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';

interface UseVoiceSocketOptions {
  lang?: string;
  onAudioChunk?: (data: ArrayBuffer) => void;
  onAudioInterrupt?: () => void;
  onAudioComplete?: () => void;
}

export function useVoiceSocket(options: UseVoiceSocketOptions = {}) {
  const { lang = 'hi-IN', onAudioChunk, onAudioInterrupt, onAudioComplete } = options;
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const setError = useVoiceSessionStore((state) => state.setError);
  const appendPartialTranscript = useVoiceSessionStore((state) => state.appendPartialTranscript);
  const setFinalTranscript = useVoiceSessionStore((state) => state.setFinalTranscript);
  const setSessionStatus = useVoiceSessionStore((state) => state.setStatus);
  const setAnswerDone = useVoiceSessionStore((state) => state.setAnswerDone);

  const handleMessage = useCallback((msg: BackendJsonEvent) => {
    switch (msg.event) {
      case 'transcript.partial':
        appendPartialTranscript(msg.text);
        break;
      case 'transcript.final':
        setFinalTranscript(msg.text);
        setSessionStatus('awaiting_response');
        break;
      case 'llm.response':
        setSessionStatus('streaming_answer');
        setAnswerDone(msg.text);
        break;
      case 'audio.complete':
        setSessionStatus('done');
        onAudioComplete?.();
        break;
      case 'audio.interrupt':
        onAudioInterrupt?.();
        break;
      case 'llm.error':
        setError(msg.text);
        break;
    }
  }, [appendPartialTranscript, onAudioComplete, onAudioInterrupt, setAnswerDone, setError, setFinalTranscript, setSessionStatus]);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const encodedLang = encodeURIComponent(lang);
      const ws = new WebSocket(`${wsProtocol}://${window.location.host}/api/v1/ws/${encodedLang}`);
      ws.binaryType = 'arraybuffer';
      
      ws.onopen = () => setStatus('connected');
      ws.onclose = (event) => {
        if (event.code === 1008) {
          setError('Rate limit exceeded. Please retry in a moment.');
          setStatus('error');
          return;
        }
        if (event.code === 1011) {
          setError('Session timed out due to inactivity. Start a new prompt.');
          setStatus('error');
          return;
        }
        setStatus('disconnected');
      };
      ws.onerror = () => setStatus('error');
      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          onAudioChunk?.(event.data);
          return;
        }

        if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((chunk) => onAudioChunk?.(chunk));
          return;
        }

        try {
          const msg = JSON.parse(event.data as string) as BackendJsonEvent;
          handleMessage(msg);
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };
      
      wsRef.current = ws;
    } catch (e) {
      setStatus('error');
    }
  }, [handleMessage, lang, onAudioChunk, setError]);

  const send = useCallback((data: ArrayBuffer | ArrayBufferView | string) => {
    if (wsRef.current && wsRef.current.readyState === 1) { // OPEN
      wsRef.current.send(data as any);
    }
  }, []);

  const close = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.CONNECTING) {
        const pendingSocket = wsRef.current;
        pendingSocket.addEventListener('open', () => pendingSocket.close(), { once: true });
        wsRef.current = null;
        return;
      }

      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { status, connect, send, close };
}
