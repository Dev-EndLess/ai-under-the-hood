/**
 * 01 — JSON Mode: Ottenere JSON dal modello (modo base)
 *
 * JSON Mode è il modo più semplice per ottenere JSON strutturato.
 * Aggiungi `response_format: { type: "json_object" }` e il modello
 * è OBBLIGATO a restituire JSON valido.
 *
 * ⚠️ ATTENZIONE: JSON Mode garantisce che l'output sia JSON valido,
 * ma NON garantisce quale sarà la struttura (chiavi, tipi, ecc).
 * Per quello serve JSON Schema Mode (vedi 02-json-schema.ts).
 *
 * 💡 REGOLA IMPORTANTE: Quando usi JSON Mode, DEVI dire nel prompt
 * di restituire JSON. Se non lo fai, l'API potrebbe andare in loop.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Manca OPENAI_API_KEY nel file .env");
  process.exit(1);
}

async function main() {
  console.log("📤 Richiesta con JSON Mode...\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        {
          role: "system",
          // ⚠️ DEVI menzionare "JSON" nel prompt quando usi JSON Mode!
          content:
            "Sei un assistente culinario. Rispondi SEMPRE in formato JSON.",
        },
        {
          role: "user",
          content:
            "Dammi una ricetta per la pasta con il pesto con ingredienti e passaggi.",
        },
      ],
      // ─── JSON MODE ──────────────────────────────────────────
      // Questo forza il modello a restituire JSON valido.
      // Senza questo, il modello potrebbe restituire:
      //   "Ecco la ricetta: { ... }" ← il testo prima rompe JSON.parse()
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Errore:", error);
    process.exit(1);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // ─── PARSING DEL JSON ─────────────────────────────────────────
  // Con JSON Mode attivo, content è GARANTITO essere JSON valido.
  // Ma le CHIAVI non sono garantite — il modello potrebbe usare
  // "ingredienti" o "ingredients" o "lista_ingredienti"...
  try {
    const recipe = JSON.parse(content);

    console.log("✅ JSON parsato con successo!\n");
    console.log("📋 Struttura ricevuta:");
    console.log(JSON.stringify(recipe, null, 2));

    // ─── IL PROBLEMA DI JSON MODE ──────────────────────────────
    // Non sai in anticipo le chiavi! Devi "sperare" che il modello
    // usi quelle che hai chiesto nel prompt.
    console.log("\n⚠️  Nota: le chiavi del JSON dipendono dal prompt.");
    console.log('   Il modello potrebbe usare "ingredienti" o "ingredients".');
    console.log("   Per avere garanzie sullo schema → vedi 02-json-schema.ts");
  } catch {
    // Questo non dovrebbe MAI succedere con JSON Mode attivo
    console.error("❌ JSON non valido (non dovrebbe succedere!):", content);
  }
}

main();
