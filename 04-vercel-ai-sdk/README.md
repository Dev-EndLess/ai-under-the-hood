# 02 — Vercel AI SDK Integration

In questa sottocartella vediamo come le astrazioni moderne rendano il lavoro molto più semplice, sicuro e veloce rispetto all'implementazione manuale.

## 🚀 Vantaggi dell'SDK

- **Gestione automatica dello streaming**: Gestione automatica dei buffer SSE.
- **Structured Output**: Validazione dei dati tramite Zod.
- **Automated Agents**: Loop di tool-calling gestito tramite la proprietà `maxSteps`.

## 📂 Struttura dei Labs

### [01-basics-generate.ts](01-basics-generate.ts)

Basi dell'SDK: come gestire chiamate semplici e **Streaming** in poche righe di codice.

- **Cosa astrae?**: Le `fetch` manuali della sezione [01-llm-core/01-messages-and-roles](../../01-llm-core/01-messages-and-roles/) e tutto il parsing del ReadableStream/SSE visto in [01-llm-core/02-streaming](../../01-llm-core/02-streaming/).

### [02-structured-output.ts](02-structured-output.ts)

Generazione di JSON garantiti. Usiamo **Zod** per definire uno schema e l'SDK si occupa di validare la risposta dell'AI.

- **Cosa astrae?**: La gestione manuale del `json_mode` e del `JSON Schema` vista in [01-llm-core/03-structured-output](../../01-llm-core/03-structured-output/).

### [03-sdk-tool-calling.ts](03-sdk-tool-calling.ts)

Agenti automatici. Vediamo come la proprietà `maxSteps`, ora rinominata in `stopWhen`, permetta all'AI di usare tool in un loop autonomo senza scrivere codice extra.

- **Cosa astrae?**: Il loop `while` infinito, la gestione dell'array `messages` e l'esecuzione manuale dei tool vista in [02-agentic-patterns/02-native-function-agent](../../02-agentic-patterns/02-native-function-agent/).

### [04-sdk-embeddings.ts](04-sdk-embeddings.ts)

RAG ottimizzato. Usiamo `embedMany` per generare vettori in massa e integrarli velocemente con Supabase.

- **Cosa astrae?**: Le chiamate singole all'endpoint `/embeddings` viste in [03-rag-fundamentals/01-fundamentals](../01-vector-db-mechanics/).

## 📚 Documentazione Ufficiale

### Vercel AI SDK

- **Core Generation**: [`generateText` e `streamText`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#generatetext)
- **Structured Output and JSON objects**: [Structured Output with Zod](https://ai-sdk.dev/docs/agents/building-agents#structured-output) e [Structured JSON data `generateObject`](https://ai-sdk.dev/cookbook/next/generate-object#generate-object)
- **Embeddings**: [Generazione massiva con `embedMany`](https://ai-sdk.dev/docs/reference/ai-sdk-core/embed-many#embedmany)
- **Agents & Loops**: [Controllo del loop con `stopWhen`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#stop-when)
- **Event Callbacks**: [Event Callbacks](https://ai-sdk.dev/docs/ai-sdk-core/event-listeners#stop-when)

### Supabase

- **Vector Search**: [Guida all'uso di pgvector e match_documents](https://supabase.com/docs/guides/database/extensions/pgvector)

## 🚀 Esecuzione

```bash
npm run 01:sdk-basics-generate
npm run 02:sdk-structured-output
npm run 03:sdk-tools-callings
npm run 04:sdk-embeddings-retrieval
```
