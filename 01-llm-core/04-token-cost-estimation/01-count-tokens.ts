/**
 * 01 — Count Tokens: Conta i token di un testo LOCALMENTE con tiktoken
 *
 * tiktoken è la libreria ufficiale di OpenAI per la tokenizzazione.
 * Ti permette di sapere quanti token consumerà un testo SENZA
 * chiamare l'API — utile per:
 *   - Stimare il costo prima di una chiamata
 *   - Verificare di non sforare il context window
 *   - Capire perché l'italiano "costa" di più dell'inglese
 *
 * La tokenizzazione è DETERMINISTICA: stesso testo → stessi token, sempre.
 */

import { encoding_for_model } from "tiktoken";

// ─── ENCODING PER MODELLO ──────────────────────────────────────────
// Ogni modello usa un encoding diverso.
// GPT-4o e GPT-4o-mini usano "o200k_base" (200K vocabolario).
// GPT-3.5 e GPT-4 usavano "cl100k_base" (100K vocabolario).
//
// encoding_for_model() sceglie automaticamente quello giusto.
const encoder = encoding_for_model("gpt-4o-mini");

// ─── FUNZIONE HELPER ────────────────────────────────────────────────
function countTokens(text: string): {
  count: number;
  tokens: number[];
  decoded: string[];
} {
  // encode() converte il testo in un array di token ID (numeri)
  const tokens = encoder.encode(text);

  // Possiamo anche decodificare ogni token singolarmente
  // per vedere cosa "vede" il modello
  const decoded = Array.from(tokens).map((t) => {
    // Decodifica il singolo token ID in testo
    const bytes = encoder.decode(new Uint32Array([t]));
    return new TextDecoder().decode(bytes);
  });

  return {
    count: tokens.length,
    tokens: Array.from(tokens),
    decoded,
  };
}

// ─── ESPERIMENTI ────────────────────────────────────────────────────

console.log("🔢 TOKEN COUNTER\n");
console.log("═".repeat(60));

// ─── Test 1: Testo semplice ──────────────────────────────────────
const text1 = "Ciao, come stai?";
const result1 = countTokens(text1);

console.log(`\n📝 Testo: "${text1}"`);
console.log(`   Token count: ${result1.count}`);
console.log(`   Token IDs:   [${result1.tokens.join(", ")}]`);
console.log(`   Decodificati: ${JSON.stringify(result1.decoded)}`);

// ─── Test 2: Testo inglese (per confronto) ───────────────────────
const text2 = "Hello, how are you?";
const result2 = countTokens(text2);

console.log(`\n📝 Testo: "${text2}"`);
console.log(`   Token count: ${result2.count}`);
console.log(`   Decodificati: ${JSON.stringify(result2.decoded)}`);

// ─── Test 3: Paragrafo più lungo ─────────────────────────────────
const longText = `L'intelligenza artificiale è un campo dell'informatica che si 
occupa di creare sistemi in grado di svolgere compiti che normalmente richiedono 
l'intelligenza umana. Questi compiti includono il riconoscimento vocale, la 
comprensione del linguaggio naturale e il processo decisionale.`;

const result3 = countTokens(longText);

console.log(`\n📝 Paragrafo lungo (${longText.length} caratteri):`);
console.log(`   Token count: ${result3.count}`);
console.log(
  `   Rapporto: ~${(longText.split(" ").length / result3.count).toFixed(2)} parole per token`,
);

// ─── Test 4: Codice ──────────────────────────────────────────────
const code = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

const result4 = countTokens(code);

console.log(`\n📝 Codice TypeScript (${code.length} caratteri):`);
console.log(`   Token count: ${result4.count}`);
console.log(`   Decodificati: ${JSON.stringify(result4.decoded)}`);

// ─── Test 5: Simulazione di un messages array ───────────────────
// In una chiamata reale, conta anche i token del system prompt
// e dei messaggi precedenti!
console.log("\n" + "═".repeat(60));
console.log("💬 SIMULAZIONE: Token totali di una conversazione\n");

const systemPrompt =
  "Sei un assistente esperto di cucina italiana. Rispondi in modo dettagliato.";
const userMessage = "Come si fa la pasta alla carbonara?";

const systemTokens = countTokens(systemPrompt).count;
const userTokens = countTokens(userMessage).count;
// Overhead per i metadata dei messaggi (~4 token per messaggio per role/formatting)
const overhead = 8;

const totalInput = systemTokens + userTokens + overhead;

console.log(`   System prompt: ${systemTokens} token`);
console.log(`   User message:  ${userTokens} token`);
console.log(`   Overhead:      ~${overhead} token (metadata messaggi)`);
console.log(`   ────────────────────────`);
console.log(`   TOTALE INPUT:  ~${totalInput} token`);
console.log(`\n   💡 Questi sono solo gli INPUT token.`);
console.log(`   L'OUTPUT (risposta del modello) si conta dopo la chiamata.`);

// ─── CLEANUP ────────────────────────────────────────────────────
// tiktoken alloca memoria nativa — va liberata esplicitamente
encoder.free();
