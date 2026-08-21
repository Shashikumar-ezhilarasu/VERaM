export type WsMessageFromClient =
  | { type: "start_session"; sampleRate: number; encoding: "pcm16"; lang: "auto" }
  | { type: "end_utterance" }
  | { type: "end_session" };

export type WsMessageFromServer =
  | { type: "ack"; sessionId: string }
  | { type: "transcript_partial"; text: string }
  | { type: "transcript_final"; text: string }
  | { type: "answer_token"; token: string }
  | { type: "answer_done"; text: string; sources?: { chunkId: string; snippet: string }[] }
  | { type: "latency"; sttMs: number; retrievalMs: number; generationMs: number; totalMs: number }
  | { type: "guardrail_blocked"; reason: string }
  | { type: "error"; message: string };
