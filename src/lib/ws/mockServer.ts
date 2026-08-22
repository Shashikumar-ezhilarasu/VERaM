import { BackendJsonEvent } from './protocol';

export type MockConnection = {
  send: (data: string | ArrayBuffer | ArrayBufferView) => void;
  close: () => void;
  readyState: number;
};

export function createMockServer(
  onMessage: (msg: BackendJsonEvent) => void,
  onOpen: () => void,
  onClose: () => void
): MockConnection {
  let isClosed = false;

  const connection: MockConnection = {
    readyState: 0, // CONNECTING
    send: (data) => {
      if (isClosed) return;
      if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
        // Simulate STT + LLM completion after receiving audio bytes.
        setTimeout(() => {
          if (!isClosed) onMessage({ event: 'transcript.partial', text: 'what is' });
        }, 300);
        setTimeout(() => {
          if (!isClosed) onMessage({ event: 'transcript.final', text: 'What is the capital of Goa?' });
        }, 700);
        setTimeout(() => {
          if (!isClosed) onMessage({ event: 'llm.response', text: 'The capital of Goa is Panaji.' });
        }, 1200);
        setTimeout(() => {
          if (!isClosed) onMessage({ event: 'audio.complete' });
        }, 1600);
      } else {
        // Ignore text messages in the mock path.
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
    }
  }, 500);

  return connection;
}
