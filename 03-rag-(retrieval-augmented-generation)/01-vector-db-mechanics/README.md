# 01 — Vector DB Mechanics (Manual RAG)

In questa sezione esploriamo i fondamentali "sotto il cofano" del RAG. Vedremo come gestire manualmente ogni fase del processo, dalla preparazione del database alla ricerca semantica.

## 🧱 I Pilastri del RAG Manuale

Il processo si divide in tre fasi principali:

1. **Ingestion (Indicizzazione)**: Rompiamo i documenti in pezzi e li trasformiamo in vettori matematici.
2. **Retrieval (Recupero)**: Quando l'utente fa una domanda, cerchiamo nel database i pezzi più simili.
3. **Generation (Generazione)**: Mandiamo i pezzi trovati all'AI come "contesto" per generare la risposta.

## 📂 Struttura dei Labs

### [00-vector-db-setup.sql](00-vector-db-setup.sql)

Configurazione del Database. Usiamo **Supabase** (PostgreSQL) con l'estensione **`pgvector`**. Qui creiamo la tabella `documents` e la funzione SQL `match_documents` per la ricerca.

### [01-embeddings-basics.ts](01-embeddings-basics.ts)

Cosa sono gli **Embeddings**. Usiamo OpenAI per trasformare le parole in liste di numeri (vettori) e capiamo come calcolare la loro "vicinanza" semantica tramite la _Cosine Similarity_.

### [02-text-splitting.ts](02-text-splitting.ts)

La logica del **Chunking**: dividere i documenti in pezzi di dimensioni fisse cercando di non tagliare le parole o le frasi a metà.

### [03-chunk-overlap.ts](03-chunk-overlap.ts)

**Advanced Chunking**: Implementiamo la tecnica dell'**Overlap**. Facciamo in modo che ogni pezzo di testo contenga una parte del pezzo precedente, così da non perdere mai il contesto semantico ai confini dei chunk.

> [!NOTE]
> **Semantic Splitting vs Technical Splitting**: Qui lo "splitting" serve a preservare il significato per l'AI. È diverso dallo splitting tecnico visto nella sezione Streaming, dove serviva solo a gestire i buffer di rete.

### [04-store-and-search.ts](04-store-and-search.ts)

Il flusso completo end-to-end. Carichiamo documenti reali su Supabase e implementiamo la funzione di ricerca semantica.

## 🚀 Esecuzione

```bash
npm run 01:embeddings-basics
npm run 01:text-splitting
npm run 01:store-and-search-full-rag
```
