# 05 — Hyperparameters

Parametri che controllano **come** il modello genera il testo, senza cambiare il prompt.

## Temperature

Controlla la "casualità" nella scelta del prossimo token.

| Valore | Effetto                     | Caso d'uso                  |
| ------ | --------------------------- | --------------------------- |
| 0      | Deterministico, prevedibile | Codice, dati, estrazioni    |
| 0.7    | Bilanciato                  | Chatbot, assistenti         |
| 1.0    | Creativo                    | Scrittura, brainstorming    |
| 1.5+   | Caotico, imprevedibile      | Esperimenti, arte generativa|

> A temperature 0, la stessa domanda produce (quasi) sempre la stessa risposta.
> A temperature alta, ogni esecuzione è diversa.

## Top P (Nucleus Sampling)

Approccio alternativo alla temperature. Invece di scalare le probabilità, **taglia** le opzioni.

- `top_p: 0.1` → Il modello sceglie solo dal top 10% dei token più probabili.
- `top_p: 1.0` → Considera tutti i token (default).

> **Nota**: OpenAI consiglia di modificare `temperature` **oppure** `top_p`, non entrambi contemporaneamente.

## Come si passano

```ts
body: JSON.stringify({
  model: "gpt-4o-mini",
  messages,
  temperature: 0.7, // ← qui
  top_p: 1.0,       // ← e/o qui
});
```

## 📖 Docs

- [API Reference — temperature](https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature)
- [API Reference — top_p](https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p)
