/**
 * 01 — Basic Call: Chiamata raw all'API OpenAI con fetch()
 *
 * Questo file mostra il MINIMO INDISPENSABILE per parlare con un LLM:
 * 1. Costruisci l'array `messages`
 * 2. Fai una POST a /v1/chat/completions
 * 3. Parsi la response JSON
 *
 * Niente SDK, niente astrazioni — solo fetch().
 * Quando usi Vercel AI SDK o OpenRouter, sotto il cofano fanno ESATTAMENTE questo.
 */

import "dotenv/config";

// ─── TIPO PER I MESSAGGI ───────────────────────────────────────────
// Questo è il formato che l'API OpenAI si aspetta per ogni messaggio.
// SDK come Vercel AI SDK definiscono i propri tipi, ma sotto viene mappato a questo.
type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ─── CONFIGURAZIONE ────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY mancante nel file .env");
  console.error("   Copia .env.example in .env e inserisci la tua chiave");
  process.exit(1);
}

// ─── COSTRUZIONE DEI MESSAGGI ──────────────────────────────────────
// Questo array È la conversazione. L'LLM è stateless: non ricorda nulla.
// Sei tu a mandare tutta la cronologia ogni volta.
const messages: ChatMessage[] = [
  {
    role: "user",
    content: "Spiegami cos'è una API in 2 frasi semplici.",
  },
];

// ─── CHIAMATA ALL'API ──────────────────────────────────────────────
// Questa è la chiamata che OGNI SDK fa sotto il cofano.
// POST a /v1/chat/completions con:
//   - model: quale modello usare
//   - messages: l'array di messaggi
async function main() {
  console.log("📤 Invio richiesta all'API OpenAI...\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      // L'autenticazione è un semplice Bearer token
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // gpt-4o-mini: economico e veloce, perfetto per imparare
      model: "gpt-4o-mini",
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Errore API:", error);
    process.exit(1);
  }

  // ─── PARSING DELLA RESPONSE ────────────────────────────────────
  // La struttura della response è sempre la stessa:
  // {
  //   id: "chatcmpl-...",
  //   choices: [
  //     {
  //       index: 0,
  //       message: { role: "assistant", content: "..." },
  //       finish_reason: "stop"
  //     }
  //   ],
  //   usage: { prompt_tokens: X, completion_tokens: Y, total_tokens: Z }
  // }

  const data = await response.json();

  // Il contenuto della risposta è SEMPRE in choices[0].message.content
  const assistantMessage = data.choices[0].message.content;

  console.log("🤖 Risposta del modello:");
  console.log(assistantMessage);

  // ─── METADATI UTILI ────────────────────────────────────────────
  // L'API ti dice sempre quanti token hai consumato
  console.log("\n📊 Usage:");
  console.log(`   Prompt tokens:     ${data.usage.prompt_tokens}`);
  console.log(`   Completion tokens: ${data.usage.completion_tokens}`);
  console.log(`   Totale:            ${data.usage.total_tokens}`);

  // ─── RESPONSE COMPLETA (per studio) ────────────────────────────
  // Decommenta per vedere TUTTA la struttura della response
  console.log("\n🔍 Response completa:");
  console.log(JSON.stringify(data, null, 2));
}

main();
