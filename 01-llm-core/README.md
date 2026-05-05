# 01 — LLM Core

I fondamentali di come funziona una chiamata a un LLM sotto il cofano.
Tutto quello che SDK come **Vercel AI SDK**, **OpenRouter**, e l'**OpenAI SDK** nascondono dietro API pulite.

> Qui si usa **solo `fetch()`** — niente SDK. L'obiettivo è capire il meccanismo, non usare scorciatoie.

## Prerequisiti

- **Node.js** ≥ 18 (serve per `fetch()` nativo)
- **API Key OpenAI** — settata in `.env` (copia `.env.example`)

## Come eseguire

Dalla root del progetto:

```bash
# Con npm scripts
npm run 01:basic
npm run 02:stream-raw
npm run 03:json-mode
npm run 04:count-tokens
npm run 05:temp
npm run 06:tool

# Oppure direttamente
npx tsx 01-llm-core/01-messages-and-roles/01-basic-call.ts
```

## Sezioni

### [01 — Messages and Roles](./01-messages-and-roles/)

Il building block fondamentale: come si struttura una chiamata API con l'array `messages` e i ruoli `system`, `user`, `assistant`.

### [02 — Streaming](./02-streaming/)

Come funziona lo streaming SSE (Server-Sent Events) sotto il cofano. Parsing manuale del `ReadableStream` e pattern async generator.

### [03 — Structured Output](./03-structured-output/)

Come ottenere JSON strutturato dall'LLM: JSON Mode vs JSON Schema Mode. Il "Zod manuale" — quello che `generateObject()` fa sotto.

### [04 — Token & Cost Estimation](./04-token-cost-estimation/)

Conta token con tiktoken e stima il costo in $ prima di fare la chiamata. Essenziale per il controllo dei costi in produzione.

### [05 — Hyperparameters](./05-hyperparameters/)

I parametri che controllano il comportamento del modello: `temperature` (creatività vs determinismo) e `top_p` (nucleus sampling). Esperimenti pratici per vedere come cambiano le risposte.

- 📖 [Docs — Temperature e Top P](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature)

### [06 — Tool Use (Function Calling)](./06-tool-use/)

Come dare "poteri" all'LLM: definire funzioni che il modello può decidere di chiamare (es. web search, accesso a DB, API esterne). Il meccanismo alla base degli AI Agent.

- 📖 [Docs — Function Calling](https://platform.openai.com/docs/guides/function-calling)

## Dettaglio file

| Sezione                  | File                    | Cosa fa                                                        |
| ------------------------ | ----------------------- | -------------------------------------------------------------- |
| 01-messages-and-roles    | `01-basic-call.ts`      | Fetch raw → API OpenAI, messages array, parsing response       |
|                          | `02-system-prompt.ts`   | 3 personalità diverse + multi-turn conversation (stateless)    |
| 02-streaming             | `01-stream-raw.ts`      | ReadableStream + TextDecoder + SSE parsing manuale             |
|                          | `02-stream-helpers.ts`  | `parseSSELine()` + `streamCompletion()` come async generator   |
| 03-structured-output     | `01-json-mode.ts`       | `response_format: { type: "json_object" }` — il modo base      |
|                          | `02-json-schema.ts`     | `response_format: { type: "json_schema" }` — lo "Zod manuale"  |
| 04-token-cost-estimation | `01-count-tokens.ts`    | tiktoken per contare token localmente                          |
|                          | `02-estimate-cost.ts`   | Stima costo in $ + confronto con costo reale                   |
| 05-hyperparameters       | `01-temp-top-p.ts`      | Temperature 0 vs 1 vs 1.8 — effetto sulla creatività           |
| 06-tool-use              | `01-web-search-tool.ts` | Function Calling: definire e usare tools (web search simulata) |

## Mappa mentale

```ts
Chiamata LLM = fetch() con:
├── URL:     POST /v1/chat/completions
├── Headers: Authorization: Bearer sk-...
├── Body:
│   ├── model: "gpt-4o-mini"
│   ├── messages: [{ role, content }, ...]     ← 01-messages-and-roles
│   ├── stream: true/false                     ← 02-streaming
│   ├── response_format: { type: "..." }       ← 03-structured-output
│   ├── temperature / top_p                    ← 05-hyperparameters
│   └── tools: [{ type: "function", ... }]     ← 06-tool-use
└── Response:
    ├── choices[0].message.content              ← output (non-stream)
    ├── choices[0].delta.content                ← output (stream)
    ├── choices[0].message.tool_calls           ← tool invocations
    └── usage: { prompt_tokens, completion_tokens } ← 04-token-cost
```
