# 06 — Tool Use (Function Calling)

Come dare "poteri" all'LLM. Il modello non può navigare internet, leggere un DB o chiamare API,
ma può **chiedere a noi** di farlo tramite il meccanismo dei **Tools**.

## Il flusso (3 step)

```ts
Utente: "Quanto costa Bitcoin oggi?"
          │
          ▼
┌──── STEP 1: Prima chiamata ────┐
│  Mandiamo prompt + tools[]     │
│  L'AI risponde con tool_calls  │
│  (NON con testo!)              │
└────────────┬───────────────────┘
             │
             ▼
┌──── STEP 2: Esecuzione ───────┐
│  Noi eseguiamo la funzione    │
│  nel nostro codice JS/TS      │
│  (fetch API, query DB, ecc.)  │
└────────────┬──────────────────┘
             │
             ▼
┌──── STEP 3: Seconda chiamata ─┐
│  Mandiamo il risultato al     │
│  modello con role: "tool"     │
│  L'AI compone la risposta     │
│  finale in linguaggio umano   │
└───────────────────────────────┘
```

## Come si definisce un Tool

```ts
const tools = [
  {
    type: "function",
    function: {
      name: "google_search", // Nome della funzione
      description: "Cerca info su internet", // L'AI legge questo per decidere
      parameters: {
        // JSON Schema dei parametri
        type: "object",
        properties: {
          query: { type: "string", description: "La query di ricerca" },
        },
        required: ["query"],
      },
    },
  },
];
```

## La risposta dell'AI quando vuole un tool

Invece del solito `message.content`, l'AI risponde con:

```json
{
  "message": {
    "role": "assistant",
    "content": null,
    "tool_calls": [
      {
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "google_search",
          "arguments": "{\"query\": \"prezzo bitcoin oggi\"}"
        }
      }
    ]
  }
}
```

> `content` è `null` perché l'AI non sta parlando all'utente — sta chiedendo a **noi** di eseguire qualcosa.

## Come restituire il risultato

```ts
messages.push(assistantMessage); // Il messaggio con tool_calls
messages.push({
  role: "tool", // Ruolo speciale!
  tool_call_id: "call_abc123", // Deve matchare l'id della tool_call
  content: JSON.stringify(result),
});
```

## 📖 Docs

- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
