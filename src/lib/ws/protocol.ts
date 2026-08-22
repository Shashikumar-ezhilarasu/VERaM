export type BackendJsonEvent =
  | { event: "transcript.partial"; text: string }
  | { event: "transcript.final"; text: string }
  | { event: "llm.response"; text: string }
  | { event: "audio.complete" }
  | { event: "audio.interrupt" }
  | { event: "llm.error"; text: string };
