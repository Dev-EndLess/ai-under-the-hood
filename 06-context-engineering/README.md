# 06 — Context Engineering

Il **Context Engineering** è l'arte di progettare e gestire le informazioni che vengono inviate al modello. In un mondo dove i token costano e la memoria è limitata, saper ingegnerizzare il contesto è ciò che distingue uno script di test da un'applicazione professionale.

## 📂 Struttura dei Labs

### [01-openrouter-multi-model.ts](01-openrouter-multi-model.ts)

**Multi-Model Gateway**: Usiamo OpenRouter per astrarre la scelta del modello. Impariamo a cambiare "cervello" (Claude, Gemini, GPT) senza cambiare codice, scegliendo il modello in base alla dimensione della sua finestra di contesto.

### [02-few-shot-engineering.ts](02-few-shot-engineering.ts)

**Few-Shot Pattern Matching**: Dimostriamo come "Show, don't just tell" sia più efficace di lunghe istruzioni. Inseriamo esempi concreti nel contesto per forzare precisione e coerenza nell'output.

### [03-context-compression.ts](03-context-compression.ts)

**Trimming & Summarization**: Implementiamo la logica per gestire conversazioni infinite. Usiamo il **Trimming** (Sliding Window) per mantenere freschi gli ultimi messaggi e la **Summarization** per comprimere il passato senza perderne il significato.

### [04-persistent-memory.ts](04-persistent-memory.ts)

**Long-term Persistence**: Portiamo la memoria fuori dal codice e la salviamo su **Supabase**. Vediamo come caricare, salvare e resettare la memoria (summary) dell'utente, per far sì che l'AI ricordi l'utente anche tra sessioni diverse.

---

## 🛠️ Strumenti necessari

- **OpenRouter API Key**: Per il test multi-modello.
- **Supabase**: Per la persistenza della memoria (tabella `conversation_memory`).

---

## 🚀 Esecuzione

```bash
npm run 01:openrouter-multi-model
npm run 02:few-shot-engineering
npm run 03:context-compression
npm run 04:persistent-memory
```

---

## 📚 Risorse & Approfondimenti

### Ingegneria del Prompt

- **Vercel AI SDK**: [Prompt Engineering con l'SDK](https://sdk.vercel.ai/docs/concepts/prompt-engineering)
- **Prompt Engineering Guide**: [Strategie Few-Shot e Context Window](https://www.promptingguide.ai/techniques/fewshot)
- **OpenRouter**: [Modelli e Gateway Universale](https://openrouter.ai/docs)

### Gestione del Contesto

- **Lost in the Middle**: [Perché l'ordine delle info nel prompt conta](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (Articolo fondamentale sulla precisione).
- **Context Trimming**: [Strategie di Sliding Window](https://js.langchain.com/docs/modules/memory/how_to/buffer_window) (Concetti applicabili a qualsiasi SDK).

### Persistenza

- **Supabase Docs**: [Upsert e State Management](https://supabase.com/docs/reference/javascript/upsert)
- **Memory**: [Come funziona la memoria](https://docs.langchain.com/oss/javascript/deepagents/memory#memory)
- **Short-Term Memory**: [La memoria a breve termine](https://docs.langchain.com/oss/javascript/langchain/short-term-memory#short-term-memory)
- **Long-Term Memory**: [La memoria a lungo termine](https://docs.langchain.com/oss/python/langchain/long-term-memory#long-term-memory)
