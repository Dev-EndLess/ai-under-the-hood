# 02 — Streaming

## Il problema

Senza streaming, devi aspettare che il modello finisca di generare TUTTA la risposta prima di ricevere qualsiasi cosa. Con risposte lunghe, l'utente fissa uno schermo vuoto per secondi.

## La soluzione: Server-Sent Events (SSE)

OpenAI usa il protocollo **SSE** per lo streaming. Invece di una singola response JSON, il server manda un flusso di **chunk** — piccoli pezzi di testo, uno alla volta.

## Anatomia di un chunk SSE

```ts
data: {"id":"chatcmpl-...","choices":[{"delta":{"content":"Ciao"}}]}

data: {"id":"chatcmpl-...","choices":[{"delta":{"content":" mondo"}}]}

data: {"id":"chatcmpl-...","choices":[{"delta":{"content":"!"}}]}

data: [DONE]
```

### Differenza chiave: `message` vs `delta`

| Non-streaming                | Streaming                  |
| ---------------------------- | -------------------------- |
| `choices[0].message.content` | `choices[0].delta.content` |
| Risposta completa            | Un pezzo alla volta        |
| Una sola response            | Tanti chunk + `[DONE]`     |

## Come si attiva

Basta aggiungere `stream: true` nel body della request:

```typescript
body: JSON.stringify({
  model: "gpt-4o-mini",
  messages,
  stream: true, // ← questa è l'unica differenza nella request
});
```

## Cosa succede sotto

```ts
Client                                       Server (OpenAI)
  │                                                │
  │─── POST /chat/completions ────────────────────▶│
  │    { stream: true, messages: [...] }           │
  │                                                │
  │◀── HTTP 200 (text/event-stream) ───────────────│
  │◀── data: {"delta":{"content":"Ciao"}} ─────────│
  │◀── data: {"delta":{"content":"amico,"}} ───────│
  │◀── data: {"delta":{"content":"come"}} ─────────│
  │◀── data: {"delta":{"content":"stai?"}} ────────│
  │◀── data: [DONE] ───────────────────────────────│
  │                                                │
```

## Cosa imparare qui

- **01-stream-raw.ts** — Parsing manuale del ReadableStream, linea per linea.
- **02-stream-helpers.ts** — Funzioni riutilizzabili + async generator pattern.

## Perché è importante

Quando usi `streamText()` di Vercel AI SDK, sotto fa **esattamente** il parsing manuale che vedi in `01-stream-raw.ts`. L'SDK ti dà un'API pulita, ma sotto c'è un `ReadableStream` con `TextDecoder` che parsa linee SSE.
