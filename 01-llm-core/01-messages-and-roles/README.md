# 01 — Messages and Roles

## Il concetto

Ogni chiamata a un LLM è fondamentalmente **un array di messaggi**.
Non è una singola stringa — è una conversazione strutturata dove ogni messaggio ha un **ruolo**.

## I 3 ruoli

| Ruolo       | Chi parla        | Scopo                                                               |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| `system`    | Lo sviluppatore  | Istruzioni globali, personalità, vincoli. L'utente non lo vede.     |
| `user`      | L'utente finale  | Input, domande, richieste.                                          |
| `assistant` | Il modello (LLM) | Risposte precedenti. Servono per dare "memoria" alla conversazione. |

## Come funziona la chiamata

```ts
┌─────────────────────────────────────────────────┐
│                  TUA APPLICAZIONE                │
│                                                  │
│  messages = [                                    │
│    { role: "system", content: "Sei un chef..." },│
│    { role: "user",   content: "Dammi una ricet.."│
│  ]                                               │
└──────────────────────┬──────────────────────────┘
                       │ POST /v1/chat/completions
                       ▼
┌─────────────────────────────────────────────────┐
│                   OPENAI API                     │
│                                                  │
│  → Legge il system prompt                        │
│  → Legge tutti i messaggi in ordine              │
│  → Genera la risposta                            │
│                                                  │
│  response.choices[0].message = {                 │
│    role: "assistant",                            │
│    content: "Ecco la ricetta..."                 │
│  }                                               │
└─────────────────────────────────────────────────┘
```

## Cosa imparare qui

- **01-basic-call.ts** — Chiamata raw con `fetch()`. Niente SDK, solo HTTP.
- **02-system-prompt.ts** — Come il system prompt cambia il comportamento del modello.

## Punti chiave

1. **L'LLM è stateless** — non ricorda nulla tra le chiamate. Sei tu a mandare l'intera cronologia ogni volta.
2. **L'ordine conta** — il system prompt va per primo, poi i messaggi in ordine cronologico.
3. **Il modello "vede" tutto** — system + user + assistant precedenti. Più messaggi mandi, più token consumi.

## 📖 Docs

- [Text Generation Guide](https://platform.openai.com/docs/guides/text-generation)
