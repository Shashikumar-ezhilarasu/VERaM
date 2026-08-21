import { useState, useEffect, useCallback, useRef } from 'react';
import { WsMessageFromServer, WsMessageFromClient } from './protocol';
import { createMockServer, MockConnection } from './mockServer';
import { useVoiceSessionStore } from '@/store/voiceSessionStore';

export function useVoiceSocket() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | MockConnection | null>(null);
  const store = useVoiceSessionStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === 1 || status === 'connecting') return;
    setStatus('connecting');

    const isMock = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mock');

    if (isMock) {
      wsRef.current = createMockServer(
        handleMessage,
        () => setStatus('connected'),
        () => setStatus('disconnected')
      );
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    try {
      const ws = new WebSocket(`${wsUrl}/voice`);
      
      ws.onopen = () => setStatus('connected');
      ws.onclose = () => setStatus('disconnected');
      ws.onerror = () => setStatus('error');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessageFromServer;
          handleMessage(msg);
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };
      
      wsRef.current = ws;
    } catch (e) {
      setStatus('error');
    }
  }, [status]);

  const handleMessage = useCallback((msg: WsMessageFromServer) => {
    switch (msg.type) {
      case 'ack':
        // Ready to receive audio
        break;
      case 'transcript_partial':
        store.appendPartialTranscript(msg.text);
        store.setStatus('awaiting_response'); // Wait for final
        break;
      case 'transcript_final':
        store.setFinalTranscript(msg.text);
        break;
      case 'answer_token':
        store.setStatus('streaming_answer');
        store.appendAnswerToken(msg.token);
        break;
      case 'answer_done':
        store.setStatus('done');
        store.setAnswerDone(msg.text);
        break;
      case 'latency':
        store.setLatencyMetrics({
          sttMs: msg.sttMs,
          retrievalMs: msg.retrievalMs,
          generationMs: msg.generationMs,
          totalMs: msg.totalMs
        });
        break;
      case 'guardrail_blocked':
        store.setStatus('error');
        store.setGuardrailBlocked(msg.reason);
        break;
      case 'error':
        store.setError(msg.message);
        break;
    }
  }, [store]);

  const send = useCallback((data: string | ArrayBuffer | ArrayBufferView | WsMessageFromClient) => {
    if (wsRef.current && wsRef.current.readyState === 1) { // OPEN
      if (typeof data === 'object' && !('byteLength' in data)) {
        wsRef.current.send(JSON.stringify(data));
      } else {
        wsRef.current.send(data as any);
      }
    }
  }, []);

  const close = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { status, connect, send, close };
}
