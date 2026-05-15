/**
 * 02 — Few-Shot Engineering (Show, Don't Just Tell)
 *
 * IL CONCETTO:
 * Invece di scrivere istruzioni lunghissime, forniamo al modello una serie di
 * coppie "Esempio-Risposta" (Few-Shot). Questo attiva la capacità dell'LLM di
 * "imitare il pattern" invece di limitarsi a interpretare una regola.
 *
 * PERCHÉ È FONDAMENTALE:
 * 1. Rigore del Formato: Forza il modello a rispondere ESATTAMENTE come vogliamo (es. secco, JSON, etc).
 * 2. Gestione dei Casi Limite: Gli esempi chiariscono le ambiguità che le regole a parole non coprono.
 * 3. Potenziamento Modelli Piccoli: Permette a modelli economici (come Llama 8B o GPT-4o-mini)
 *    di raggiungere la precisione di modelli molto più grandi e costosi.
 *
 * ⚠️ ATTENZIONE (Il Bias):
 * Il Few-Shot insegna un pattern, non una regola logica universale. Se gli esempi sono
 * sbilanciati, il modello smetterà di "ragionare" e inizierà a "imitare", rischiando
 * di sbagliare su casi complessi (vedi l'esempio della batteria/driver alla fine).
 */

import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// 1. Scenario: Classificatore di ticket tecnici "difficili"
const technicalPrompt = `
Classifica i ticket di supporto in: [HARDWARE, SOFTWARE, NETWORK].
Rispondi SOLO con la categoria in maiuscolo.
`;

const examples = [
  { input: "Il mouse non si muove più.", output: "HARDWARE" },
  { input: "Non riesco a loggarmi su Outlook.", output: "SOFTWARE" },
  { input: "Internet è lento in tutta la sede.", output: "NETWORK" },
  // Esempio chiave: educa il modello che crash software ≠ hardware rotto
  {
    input: "Il PC va in crash con schermo blu dopo un aggiornamento.",
    output: "SOFTWARE",
  },
  // Esempio chiave: stampante condivisa = problema di rete
  {
    input: "Nessuno riesce a stampare sulla stampante condivisa.",
    output: "NETWORK",
  },
];

/**
 * Funzione per testare l'AI in modalità Zero-Shot vs Few-Shot
 */
async function runComparison(query: string) {
  console.log(`\n🎫 Ticket da classificare: "${query}"`);

  // --- ZERO-SHOT (Senza esempi) ---
  const zeroShot = await generateText({
    model: openai(process.env.AI_MODEL!),
    system: technicalPrompt,
    prompt: query,
  });
  console.log(`❌ Zero-Shot: ${zeroShot.text}`);

  // --- FEW-SHOT (Con esempi integrati nel prompt) ---
  // Trasformiamo gli esempi in una stringa leggibile per il contesto
  const fewShotContext = examples
    .map((ex) => `Input: ${ex.input}\nOutput: ${ex.output}`)
    .join("\n\n");

  const fewShot = await generateText({
    model: openai("gpt-3.5-turbo"),
    system: `${technicalPrompt}\n\nEsempi:\n${fewShotContext}`,
    prompt: `Input: ${query}\nOutput:`,
  });
  console.log(`✅ Few-Shot: ${fewShot.text}`);
}

async function main() {
  console.log("🎯 CONTEXT ENGINEERING: Few-Shot Pattern Matching\n");

  const testTickets = [
    // AMBIGUO: la stampante è sia hardware che network (stampante di rete)
    // Zero-shot tende a dire HARDWARE, few-shot con esempio giusto dice NETWORK
    "La stampante non stampa da nessun PC dell'ufficio.",

    // AMBIGUO: VPN è software o network?
    // Zero-shot oscilla, few-shot con esempio VPN→NETWORK è consistente
    "La VPN si disconnette ogni 10 minuti.",

    // TRABOCCHETTO: "schermo blu" sembra hardware ma è SOFTWARE (BSOD = kernel crash)
    // Zero-shot quasi sempre sbaglia → HARDWARE
    "Ho lo schermo blu in tutti i computer dell'ufficio dopo l'aggiornamento di Windows di ieri.",

    // TRABOCCHETTO: "batteria" sembra hardware ma se è un portatile aziendale
    // con gestione batteria via software → ambiguo
    "Il notebook aziendale si spegne al 40% di batteria da quando ho aggiornato i driver.",
  ];

  for (const ticket of testTickets) {
    await runComparison(ticket);
  }

  console.log(`
💡 LEZIONI APPRESE:
   ✅ Few-Shot vince sulle ambiguità strutturali (stampante di rete, VPN).
   ⚠️  Few-Shot può DISTORCERE se gli esempi sono mal calibrati:
      → Il caso "batteria + driver" è tecnicamente SOFTWARE, ma l'esempio 
        precedente sulla batteria ha "ancorato" il modello su HARDWARE.
   📌 Regola d'oro: Garbage in, Garbage out. Gli esempi sono un contratto:
      se il contratto è sbilanciato, l'AI seguirà il pattern anche quando è sbagliato.
`);
}

main().catch(console.error);
