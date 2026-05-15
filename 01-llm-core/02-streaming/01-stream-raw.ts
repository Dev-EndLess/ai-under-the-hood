/**
 * 01 — Stream Modern: Streaming efficiente con Async Iterators
 * 
 * Questo è il modo più moderno e pulito di gestire lo streaming in Node.js (v18+).
 * Sfrutta gli "Async Iterators" per leggere i pacchetti di dati (chunk)
 * man mano che arrivano, senza dover gestire manualmente i Reader.
 * 
 * Invece di aspettare 10 secondi per una risposta completa, iniziamo a
 * mostrare i token all'utente dopo pochi millisecondi.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── 1. FUNZIONE PER LA CHIAMATA API ───────────────────────────────
async function fetchChatStream(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  // Restituiamo il body come un iteratore di bytes
  return response.body as unknown as AsyncIterable<Uint8Array>;
}

// ─── 2. FUNZIONE PER IL PROCESSING ─────────────────────────────────
// Si occupa di decodificare i bytes e gestire il protocollo SSE.
async function processStream(stream: AsyncIterable<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = "";

  process.stdout.write("🤖 ");

  // Il ciclo "for await" si attiva ogni volta che arriva un nuovo chunk
  for await (const chunk of stream) {
    // Decodifica i bytes in testo
    buffer += decoder.decode(chunk, { stream: true });

    // Dividiamo il buffer in righe (SSE separa gli eventi con \n)
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

      // Estraiamo il JSON togliendo il prefisso "data: "
      const jsonContent = trimmedLine.slice(6);

      if (jsonContent === "[DONE]") {
        console.log("\n\n✅ Stream completato.");
        return;
      }

      try {
        const parsed = JSON.parse(jsonContent);
        const token = parsed.choices[0]?.delta?.content;
        if (token) process.stdout.write(token);
      } catch (error) {
        console.error("\n⚠️ Errore parsing chunk:", error);
      }
    }
  }
}

// ─── LOGICA PRINCIPALE ──────────────────────────────────────────────
async function main() {
  try {
    const prompt = "Raccontami una breve storia su un robot chef.";
    console.log(`📤 Richiesta: "${prompt}"\n`);

    const stream = await fetchChatStream(prompt);
    await processStream(stream);

  } catch (err) {
    console.error("❌ Errore:", err);
  }
}

main();
