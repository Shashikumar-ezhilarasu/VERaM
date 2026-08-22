# Voice RAG Frontend (Next.js)

This frontend captures microphone audio, streams binary PCM frames over WebSocket, and renders transcript + assistant response events from the backend.

## Secure Backend Proxy (No Azure URL in Browser)

The browser never connects directly to the Azure backend domain. It always connects to same-origin path:

```text
/api/v1/ws/{lang}
```

Next.js rewrites this path server-side to your backend endpoint via `next.config.ts`.

Set a server-only environment variable:

```dotenv
BACKEND_WS_BASE_URL=<YOUR_BACKEND_URL>
```

Do not prefix it with `NEXT_PUBLIC_`, otherwise it can be exposed to client bundles.

## Run Locally

1. Install dependencies

```bash
npm install
```

2. Create `.env.local` in the project root and set:

```dotenv
BACKEND_WS_BASE_URL=<YOUR_BACKEND_URL>
```

3. Start app

```bash
npm run dev
```

4. Open demo

```text
http://localhost:3000/demo
```

## Backend Event Contract

The frontend expects backend JSON events and binary audio frames as documented in your backend README:

- `transcript.partial`
- `transcript.final`
- `llm.response`
- `audio.complete`
- `audio.interrupt`
- `llm.error`

Binary WebSocket frames are treated as assistant audio chunks.
