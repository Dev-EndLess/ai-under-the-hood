# 02 — Native Function Agent

In questa sezione passiamo dall'approccio manuale (ReAct) all'approccio **nativo di OpenAI**.

Invece di parsare il testo con le Regex, useremo il parametro `tools` nell'API. L'AI ci risponderà con un oggetto strutturato chiamato `tool_calls`, che contiene già il nome della funzione e i parametri in formato JSON.

## 🚀 I vantaggi dell'approccio Nativo

1. **Precisione**: Non c'è rischio di errori di parsing del testo.
2. **Efficienza**: L'AI consuma meno token per spiegare cosa vuole fare.
3. **Parallelismo**: L'AI può chiedere di eseguire più funzioni contemporaneamente (es. "Cerca il meteo di 3 città diverse").

## 📂 Struttura dei Lab

### [01-tool-call-logic.ts](01-tool-call-logic.ts)

Impariamo a definire i tool nell'API e a leggere la risposta speciale dell'AI. Vedremo come estrarre gli argomenti JSON riducendo al complessità.

### [02-state-management.ts](02-state-management.ts)

La parte più critica: come aggiornare la lista `messages`. Vedremo l'importanza di inserire sia il messaggio dell'assistente con la `tool_call` sia il messaggio con il ruolo `tool`.

### [03-automatic-runner.ts](03-automatic-runner.ts)

Creiamo un vero e proprio "Agent Runner". Una funzione che, data una lista di funzioni JavaScript, le esegue automaticamente finché l'AI non decide di aver terminato il compito.

---

## 🛠️ Come testarlo

Istruzioni specifiche verranno aggiunte man mano che completiamo i file.
