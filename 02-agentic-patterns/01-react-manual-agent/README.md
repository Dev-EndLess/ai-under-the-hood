# 01 — ReAct: L'Agente Manuale

In questa sezione esploriamo il pattern **ReAct** (Reason + Act), il mattone fondamentale su cui sono costruiti quasi tutti gli agenti AI moderni.

Qui non usiamo le funzioni native di OpenAI (Function Calling), ma vediamo come costruire un agente "a mano" usando solo testo e logica JavaScript.

## 🔄 Il Ciclo ReAct

L'agente non risponde subito all'utente. Segue un ciclo iterativo di pensiero e azione:

1. **Thought** (Pensiero): L'AI ragiona sul problema e decide cosa fare.
2. **Action** (Azione): L'AI sceglie un tool da usare.
3. **Action Input** (Parametro): L'AI fornisce l'input per il tool.
4. **Observation** (Osservazione): Noi eseguiamo il codice JS e diamo il risultato all'AI.
5. **Final Answer**: Una volta ottenuti i dati necessari, l'AI risponde all'utente.

## 📂 Struttura dei Lab

### [01-react-prompting.ts](01-react-prompting.ts)

Scriviamo il **System Prompt** che costringe l'AI a pensare prima di agire e a rispettare un formato rigido. È il "contratto" tra noi e l'LLM.

### [02-action-functions.ts](02-action-functions.ts)

Definiamo le funzioni JavaScript reali (i "Tool").

- **Calculator**: Una calcolatrice per operazioni matematiche.
- **Weather**: Un tool reale collegato all'API di **Open-Meteo** (Geocoding + Forecast).

### [03-manual-parsing.ts](03-manual-parsing.ts)

La parte tecnica di "traduzione". Usiamo le **Regex** per estrarre il comando `Action` e il parametro `Action Input` dal testo libero prodotto dall'AI. Senza questo passaggio, il computer non saprebbe quale funzione eseguire.

### [04-the-agent-loop.ts](04-the-agent-loop.ts)

L'orchestratore. Un ciclo `while` che gestisce lo stato della conversazione, chiama il parser, esegue i tool e rimanda i risultati all'AI finché l'obiettivo non è raggiunto.

## 🛠️ Come testarlo

Puoi lanciare l'intero agente con:

```bash
npm run 01:react-loop
```

## 📖 Approfondimenti

- [Prompting Guide - ReAct](https://www.promptingguide.ai/techniques/react)
