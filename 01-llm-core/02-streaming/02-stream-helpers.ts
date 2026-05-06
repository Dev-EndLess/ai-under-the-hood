/**
 * 04 — Stream Helpers Modern: Async Generators
 * 
 * In questa versione usiamo un "Async Generator" (async function*).
 * È il modo più professionale di gestire lo streaming: la funzione
 * "yielda" i token man mano che arrivano, e chi la chiama può usarli
 * con un semplice `for await`.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── HELPER: GENERATORE ASINCRONO ──────────────────────────────────
// Questa funzione nasconde tutto il caos del parsing SSE e restituisce
// uno stream di soli token (stringhe).
// ─── 1. TRANSPORT LAYER (RAW FETCH) ────────────────────────────────
async function fetchRawStream(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  return response.body as unknown as AsyncIterable<Uint8Array>;
}

// ─── 2. TRANSFORMATION LAYER (ASYNC GENERATOR) ─────────────────────
// Prende lo stream di bytes e "yielda" i singoli token.
async function* streamCompletion(prompt: string) {
  const stream = await fetchRawStream(prompt);
  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue;

      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const token = parsed.choices[0]?.delta?.content;
        if (token) yield token;
      } catch (e) {
        // Silently skip malformed chunks
      }
    }
  }
}

// ─── 3. UTILIZZO (CONSUMER) ─────────────────────────────────────────
async function main() {
  console.log("🚀 Utilizzo dello stream helper (Modular)...\n");
  process.stdout.write("🤖 ");

  try {
    const tokens = streamCompletion("Spiega cos'è un atomo in 3 frasi.");

    for await (const token of tokens) {
      process.stdout.write(token);
    }
  } catch (err) {
    console.error("\n❌ Errore:", err);
  }

  console.log("\n\n✨ Done!.");
}

main();
