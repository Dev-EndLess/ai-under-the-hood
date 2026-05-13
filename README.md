# 🧠 AI Under The Hood

> **Reference low-level per AI Engineering Fundamentals.**

In questa repository cerco di documentare quello che avviene dentro un LLM o Agente senza usare un SDK di alto livello. Qui **apriamo il cofano** per capire come funzionano davvero gli ingranaggi che muovono librerie come Vercel AI SDK, LangChain o OpenRouter.

## 🏗️ Struttura del Progetto

```ts
ai-under-the-hood/
│
├── 01-llm-core/                   // I Fondamentali
│   ├── 01-messages-and-roles/     // Ruoli (system, user, assistant) e statelessness
│   ├── 02-streaming/              // Web Streams, ReadableStream e parsing SSE
│   ├── 03-structured-output/      // JSON Mode e JSON Schema (il "Zod manuale")
│   ├── 04-token-cost-estimation/  // Tiktoken e calcolo dei costi in $
│   ├── 05-hyperparameters/        // Temperature e Top P: controllare la creatività
│   └── 06-tool-use/               // Il cuore degli Agenti: Function Calling
│
├── 02-agentic-patterns/           // Strategie e Architetture per Agenti
│   ├── 01-react-manual-agent/     // --- APPROCCIO MANUALE ---
│   │   ├── 01-react-prompting.ts  // Prompt: Thought → Action → Observation
│   │   ├── 02-action-functions.ts // Definizione delle funzioni reali
│   │   ├── 03-manual-parsing.ts   // Regex e Logica di estrazione comandi
│   │   └── 04-the-agent-loop.ts   // Ciclo while: esecuzione ricorsiva
│   │
│   └── 02-native-function-agent/  // --- APPROCCIO NATIVO ---
│       ├── 01-tool-call-logic.ts  // Gestione tool_calls e argomenti JSON
│       ├── 02-state-management.ts // Pushing messages: assistant vs tool roles
│       └── 03-automatic-runner.ts // Agent Runner automatizzato (mappa funzioni)
│
├── 03-rag-(retrieval-augmented-generation)/  // La memoria esterna dei modelli
│   ├── 01-vector-db-mechanics/               // --- MECCANISMI MANUALI ---
│   │   ├── 00-vector-db-setup.sql        // Setup pgvector e tabelle su Supabase
│   │   ├── 01-embeddings-basics.ts       // Vettori e Similarità
│   │   ├── 02-text-splitting.ts          // Logica di Chunking manuale
│   │   ├── 03-chunk-overlap.ts           // Chunking avanzato con sovrapposizione
│   │   └── 04-store-and-search.ts        // Flusso RAG completo: Ingestion + Search
│   │
│   └─── 00-images/                       // Diagrammi e chartflows
│
├── 04-vercel-ai-sdk/                    // --- IL MODO PIÙ PRATICO E USATO ---
│   ├── 01-basics-generate.ts            // Chiamate semplici e Streaming
│   ├── 02-structured-output.ts          // JSON sicuro con Zod
│   ├── 03-sdk-tools-callings.ts         // Agenti automatici (maxSteps/stopWhen)
│   └── 04-sdk-embeddings-retrieval.ts   // Batching e RAG con SDK
│
├── 05-advanced-agentic-patterns/   // Orchestrazione Avanzata
│   ├── 01-retrieval-routing.ts     // Router intelligente per database diversi
│   ├── 02-web-search-agent.ts      // AI con accesso ad internet reale
│   └── 03-hybrid-search-agent.ts   // Mix: RAG Locale + Web Search
│
├── 06-context-engineering/           // Memoria e Contesto
│   ├── 01-openrouter-multi-model.ts  // Gateway universale
│   ├── 02-few-shot-engineering.ts    // Pattern bias e pattern matching
│   ├── 03-context-compression.ts     // Trimming & Summarization
│   └── 04-persistent-memory.ts       // Memoria a lungo termine (Supabase)
│
└── 07-mcp-(model-context-protocol)/   // Connettività Universale
    ├── 01-mcp-client-setup.ts         // Handshake e Discovery
    ├── 02-mcp-tools-orchestration.ts  // Integrazione Tool nel loop
    ├── 03-custom-mcp-server.ts        // Costruire il proprio server MCP
    └── 04-mcp-full-agent.ts           // Agente multi-server orchestrato
```

## 🚀 Come iniziare

1. **Configura l'ambiente**:
   Crea un file `.env` (puoi copiare `.env.example`) e aggiungi la tua `OPENAI_API_KEY`.
2. **Installa le dipendenze**:

   ```bash
   npm install
   ```

3. **Lancia i laboratori**:
   Ogni cartella ha il suo `README.md` dettagliato. Puoi usare gli script nel `package.json`:

   ```bash
   npm run 01:basic-call
   npm run 02:stream-raw
   # ...e così via per tutte le sezioni
   ```

## 📚 Documentazione di riferimento

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [DeepLearning.ai - AI Engineering](https://www.deeplearning.ai/)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs) (per capire cosa stiamo emulando)
