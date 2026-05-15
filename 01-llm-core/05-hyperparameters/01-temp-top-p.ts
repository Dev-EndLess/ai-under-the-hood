/**
 * 01 — Temperature & Top P: Controllare la "creatività" del modello
 *
 * Questi due parametri influenzano come il modello sceglie la parola successiva
 * dalla sua distribuzione di probabilità.
 *
 * 1. Temperature (0.0 - 2.0):
 *    - 0.0: Deterministico. Sceglie sempre la parola più probabile. Ottimo per dati, codice, estrazioni.
 *    - 0.7 - 1.0: Bilanciato. Standard per conversazioni.
 *    - 1.5+: Caotico. Molto creativo, ma rischia di diventare incoerente o "allucinare".
 *
 * 2. Top P (0.0 - 1.0):
 *    - Un modo alternativo alla temperature (Nucleus Sampling).
 *    - 0.1: Considera solo il top 10% delle parole più probabili.
 *    - 1.0: Considera tutte le parole.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function askWithTemp(prompt: string, temp: number, topP: number) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: temp,
      top_p: topP,
      max_tokens: 50,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function main() {
  const prompt = "Scrivi una frase brevissima e originale sull'autunno.";

  console.log(`\n🧪 TEST TEMPERATURE (Prompt: "${prompt}")`);
  console.log("═".repeat(50));

  // --- TEST 1: TEMPERATURE 0 ("Deterministico/Preciso") ---
  console.log("\n❄️ TEMP 0 (Deterministico/Preciso):");
  const resp0 = await askWithTemp(prompt, 0, 0);
  console.log(`   > ${resp0}`);

  // --- TEST 2: TEMPERATURE 1 ("Creativo/Standard") ---
  console.log("\n⚖️ TEMP 1 (Creativo/Standard):");
  const resp1 = await askWithTemp(prompt, 1, 0.5);
  console.log(`   > ${resp1}`);

  // --- TEST 3: TEMPERATURE 1.8 ("Caotico/Casuale") ---
  console.log("\n🔥 TEMP 1.8 (Molto caotico/Casuale):");
  const resp2 = await askWithTemp(prompt, 1.8, 1);
  console.log(`   > ${resp2}`);
  
  console.log("\n💡 Nota: a Temp 0, se rilanci lo script, avrai quasi sempre la stessa risposta.");
  console.log("   A Temp 1.8, ogni volta sarà un'allucinazione diversa!");
}

main();
