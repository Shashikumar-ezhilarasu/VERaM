import { WsMessageFromServer } from './protocol';

export type MockConnection = {
  send: (data: string | ArrayBuffer | ArrayBufferView) => void;
  close: () => void;
  readyState: number;
};

export function createMockServer(
  onMessage: (msg: WsMessageFromServer) => void,
  onOpen: () => void,
  onClose: () => void
): MockConnection {
  let isClosed = false;

  const connection: MockConnection = {
    readyState: 0, // CONNECTING
    send: (data) => {
      if (isClosed) return;
      if (typeof data === 'string') {
        const msg = JSON.parse(data);
        if (msg.type === 'start_session') {
          // Acknowledge session start
        } else if (msg.type === 'end_utterance') {
          // Simulate the STT and generation sequence
          setTimeout(() => { if (!isClosed) onMessage({ type: 'transcript_partial', text: 'what is' }); }, 300);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'transcript_partial', text: 'what is the capital' }); }, 700);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'transcript_final', text: 'What is the capital of Goa?' }); }, 1200);
          
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'The ' }); }, 1500);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'capital ' }); }, 1600);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'of ' }); }, 1700);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'Goa ' }); }, 1800);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'is ' }); }, 1900);
          setTimeout(() => { if (!isClosed) onMessage({ type: 'answer_token', token: 'Panaji.' }); }, 2000);
          
          setTimeout(() => { 
            if (!isClosed) onMessage({ 
              type: 'latency', 
              sttMs: 350, retrievalMs: 400, generationMs: 800, totalMs: 1550 
            }); 
          }, 2100);

          setTimeout(() => { 
            if (!isClosed) onMessage({ 
              type: 'answer_done', 
              text: 'The capital of Goa is Panaji.',
              sources: [{ chunkId: 'doc-1', snippet: 'Panaji is the capital city of Goa.' }]
            }); 
          }, 2100);
        }
      } else {
        // Mock receiving binary audio frames (do nothing)
      }
    },
    close: () => {
      isClosed = true;
      connection.readyState = 3; // CLOSED
      onClose();
    }
  };

  setTimeout(() => {
    if (!isClosed) {
      connection.readyState = 1; // OPEN
      onOpen();
      onMessage({ type: 'ack', sessionId: 'mock-session-123' });
    }
  }, 500);

  return connection;
}
