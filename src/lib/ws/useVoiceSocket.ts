import { useState, useCallback, useRef, useEffect } from 'react';
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
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'>('disconnected');
  const reconnectAttempts = useRef(0);
  const connectRef = useRef<(isReconnect?: boolean) => void>(() => {});
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

  // Packet queue to prevent dropping initial audio frames during reconnection
  const packetQueueRef = useRef<ArrayBuffer[]>([]);


  const connect = useCallback((isReconnect = false) => {
    
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus(isReconnect ? 'reconnecting' : 'connecting');
    if (!isReconnect) reconnectAttempts.current = 0;
    packetQueueRef.current = [];

    try {
      const encodedLang = encodeURIComponent(lang);
      let wsUrl = '';

      let baseUrl = process.env.NEXT_PUBLIC_WS_URL 
        ? process.env.NEXT_PUBLIC_WS_URL.trim().replace(/\/$/, "") 
        : "<YOUR_BACKEND_URL>";

      // Defensively parse in case the user pasted the full path instead of just the base URL
      if (baseUrl.endsWith(`/api/v1/ws/${lang}`)) {
        baseUrl = baseUrl.replace(new RegExp(`/api/v1/ws/${lang}$`), "");
      } else if (baseUrl.endsWith('/api/v1/ws')) {
        baseUrl = baseUrl.replace(/\/api\/v1\/ws$/, "");
      }
      
      wsUrl = `${baseUrl}/api/v1/ws/${encodedLang}`;

      console.log(`[VoiceSocket] Attempting connection to: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      
      let pingInterval: NodeJS.Timeout;
      let wakeTimer: NodeJS.Timeout | null = null;
      ws.onopen = () => {
        setStatus('connected');
        reconnectAttempts.current = 0;
        useVoiceSessionStore.getState().setSystemState({ isOnline: true });
        
        wakeTimer = setTimeout(() => {
          const s = useVoiceSessionStore.getState().status;
          if (s === 'requesting_mic' || s === 'recording') {
            useVoiceSessionStore.getState().setSystemState({ isBackendWaking: true });
          }
        }, 3000);
        // Flush any packets queued while connecting
        const queue = packetQueueRef.current;
        if (queue.length > 0) {
          console.log(`[VoiceSocket] Flushing ${queue.length} queued packets`);
          for (const packet of queue) {
            ws.send(packet);
          }
          packetQueueRef.current = [];
        }

        // Keep-alive ping every 5 seconds to bypass the backend's 10s inactivity timeout.
        // We send a 20ms silent PCM frame (16000Hz * 16-bit * 0.02s = 640 bytes)
        // instead of a 0-byte buffer to prevent WebRTC VAD from crashing on the backend.
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(new ArrayBuffer(640));
          }
        }, 5000);
      };
      
      ws.onclose = (event) => {
        clearInterval(pingInterval);
        if (event.code === 1008) {
          setError('Rate limit exceeded. Please retry in a moment.');
          setStatus('error');
          return;
        }
        if (event.code === 1011) {
          console.warn('[VoiceSocket] Backend closed due to 10s inactivity.');
          setStatus('disconnected');
          setTimeout(() => connectRef.current(true), 1000);
          return;
        }
        
        console.warn(`[VoiceSocket] Unexpected close (${event.code}). Attempting reconnect...`);
        if (reconnectAttempts.current < 3) {
          const backoff = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectAttempts.current += 1;
          setStatus('reconnecting');
          setTimeout(() => connectRef.current(true), backoff);
        } else {
          setStatus('disconnected');
          useVoiceSessionStore.getState().setSystemState({ isOnline: false });
        }
      };
      ws.onerror = () => {
        clearInterval(pingInterval);
        setStatus('error');
      };
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
          if (wakeTimer) clearTimeout(wakeTimer);
          useVoiceSessionStore.getState().setSystemState({ isBackendWaking: false });
          const msg = JSON.parse(event.data as string) as BackendJsonEvent;
          handleMessage(msg);
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };
      
      wsRef.current = ws;
    } catch (_e) {
      setStatus('error');
    }
  }, [handleMessage, lang, onAudioChunk, setError]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const send = useCallback((data: ArrayBuffer | ArrayBufferView | string) => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(data);
      } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
        // Guard against VAD empty-frame crash class of bug
        let len = 0;
        if (data instanceof ArrayBuffer) len = data.byteLength;
        else if ((data as ArrayBufferView).buffer) len = (data as ArrayBufferView).byteLength;
        else if (typeof data === 'string') len = data.length;
        
        if (len === 0) {
          console.warn("[VoiceSocket] Guard: Prevented sending 0-byte frame which crashes the backend VAD.");
          return;
        }

        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(data);
        } else if (wsRef.current.readyState === WebSocket.CONNECTING) {
          if (data instanceof ArrayBuffer) packetQueueRef.current.push(data);
          else if ((data as ArrayBufferView).buffer) packetQueueRef.current.push((data as ArrayBufferView).buffer);
        }
      } else {
        console.warn(`[VoiceSocket] WebSocket not open (readyState: ${wsRef.current.readyState}). Dropping packet.`);
      }
    } else {
      console.warn("[VoiceSocket] No WebSocket instance exists. Dropping packet.");
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
