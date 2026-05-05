# 04 — Token & Cost Estimation

## Cos'è un token?

Un token **NON** è una parola. È un pezzo di testo che il modello "vede" come unità.

```ts
"Ciao mondo!"
→ Tokens: ["C", "iao", " mondo", "!"]    (4 token)

"Hello world!"
→ Tokens: ["Hello", " world", "!"]        (3 token)
```

### Regola empirica

| Lingua   | Rapporto                                                    |
| -------- | ----------------------------------------------------------- |
| Inglese  | ~1 token = ¾ di una parola                                  |
| Italiano | ~1 token = ½ di una parola (l'italiano è meno "efficiente") |
| Codice   | Varia molto (simboli spesso = 1 token ciascuno)             |

## Perché contare i token?

1. **Costo** — Paghi per token (input + output separatamente)
2. **Limiti** — Ogni modello ha un context window massimo (es. 128K token per GPT-4o)
3. **Budget** — In produzione vuoi stimare il costo PRIMA di fare la chiamata

## Pricing (Maggio 2025)

| Modello      | Input (per 1M token) | Output (per 1M token) |
| ------------ | -------------------- | --------------------- |
| gpt-4o       | $2.50                | $10.00                |
| gpt-4o-mini  | $0.15                | $0.60                 |
| gpt-4.1      | $2.00                | $8.00                 |
| gpt-4.1-mini | $0.40                | $1.60                 |
| gpt-4.1-nano | $0.10                | $0.40                 |

> I prezzi cambiano. Controlla sempre: <https://openai.com/api/pricing/>

## Come funziona la tokenizzazione

OpenAI usa **tiktoken** — un tokenizer basato su BPE (Byte Pair Encoding).
Ogni modello usa un encoding specifico (es. GPT-4o usa `o200k_base`).

Il tokenizer è **deterministico**: lo stesso testo produce sempre gli stessi token.
Questo ti permette di contare i token **localmente**, senza chiamare l'API.

## Cosa imparare qui

- **01-count-tokens.ts** — Conta i token di un testo con tiktoken, localmente.
- **02-estimate-cost.ts** — Stima il costo in $ prima di fare la chiamata.

## 📖 Docs

- [Tokenizer Tool (playground)](https://platform.openai.com/tokenizer)
- [API Pricing](https://openai.com/api/pricing/)
