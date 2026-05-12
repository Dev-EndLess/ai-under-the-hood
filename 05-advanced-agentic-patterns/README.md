# 05 — Advanced Agentic Patterns

In questa sezione esploriamo pattern avanzati dove l'AI agisce come un "Orchestratore", decidendo dinamicamente quali strumenti e fonti di dati utilizzare, se prendere informazioni da un database, fare una ricerca web, oppure prendere informazioni da entrambi.

## 📂 Struttura dei Labs

### [01-retrieval-routing.ts](01-retrieval-routing.ts)

**Smart Routing**: L'agente analizza la query dell'utente e decide se consultare il database dei prodotti, la documentazione tecnica o rispondere direttamente.

### [02-web-search-agent.ts](02-web-search-agent.ts)

**Real-time Intelligence**: Integriamo strumenti di ricerca sul web per permettere all'AI di accedere a informazioni aggiornate tramite internet, superando il limite della sua data di addestramento.

### [03-hybrid-search-agent.ts](03-hybrid-search-agent.ts)

**The Hybrid Agent**: Un agente che combina RAG locale e Ricerca Web, decidendo la strategia migliore per ogni specifica domanda.

---

## 🛠️ Strumenti necessari

Per questa sezione utilizzeremo:

- **Vercel AI SDK**
- **Tavily API**

---

## 🚀 Oltre il Web e il DB: Il Futuro degli Agenti

Cosa succede quando un agente ha accesso a tutto il tuo ecosistema digitale? Oltre alle ricerche su internet o database, ecco dove può spingersi un orchestratore avanzato:

1. **Productivity Hub**: Collegamento a Slack, Gmail, Notion o Discord per cercare nelle conversazioni e nei task.
2. **Code Expert**: Integrazione con GitHub per leggere repository e scrivere codice o documentazione.
3. **Real-Time Data**: API per quotazioni di borsa, meteo, traffico o logistica per decisioni basate sui fatti del secondo corrente.
4. **Hardware Control**: Tramite sistemi come Home Assistant, l'agente può interagire con il mondo fisico (IoT).

### 🔗 Il passo successivo: MCP (Model Context Protocol)

Tutte queste connessioni possono essere standardizzate usando **MCP**. Invece di scrivere tool personalizzati per ogni servizio, MCP permette di collegare server di dati pronti all'uso (Google Drive, Slack, PostgreSQL) direttamente al tuo agente con un unico protocollo universale.

## 📚 Documentazione e Risorse

### Orchestrazione e Agenti

- **Vercel AI SDK**: [Agenti e Multi-step Tool Calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#tool-calling)
- **Vercel AI SDK**: [Controllo del Loop con `stopWhen`](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#stop-when)

### Ricerca Web & RAG

- **Tavily API**: [Documentazione ufficiale per AI Search](https://docs.tavily.com/welcome)
- **Tavily Quick Start**: [Quick Start](https://docs.tavily.com/documentation/quickstart)
- **Pinecone**: [Hybrid Search Explained](https://www.pinecone.io/learn/hybrid-search/)

---

## 🚀 Esecuzione

```bash
npm run 01:retrieval-routing
npm run 02:web-search-agent
npm run 03:hybrid-agent
```
