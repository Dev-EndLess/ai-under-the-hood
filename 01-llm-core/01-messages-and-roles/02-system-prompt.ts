/**
 * 02 — System Prompt: Come il system message guida il comportamento del modello
 *
 * Il system prompt è la tua "leva" principale per controllare l'LLM.
 * È il primo messaggio nell'array e dice al modello CHI È e COME comportarsi.
 *
 * Esempio pratico: stesso input utente, due system prompt diversi → output completamente diversi.
 */

import "dotenv/config";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// ─── CONFIGURAZIONE ────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY mancante nel file .env");
  process.exit(1);
}

// ─── FUNZIONE HELPER ────────────────────────────────────────────────
// Astraggo la fetch per poterla riutilizzare con messaggi diversi.
// Nota: questa è GIÀ un mini-SDK. Quando usi librerie come OpenAI SDK,
// fanno esattamente questo — wrappano fetch con tipi e error handling.
async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── ESPERIMENTO: STESSO INPUT, DUE PERSONALITÀ ───────────────────
// Mandiamo la STESSA domanda a due "versioni" del modello,
// cambiate solo dal system prompt.

const userQuestion = "Cosa sono i buchi neri?";

async function main() {
  // ─── PERSONALITÀ 1: Scienziato formale ──────────────────────────
  console.log("🔬 SCIENZIATO FORMALE");
  console.log("─".repeat(50));

  const scientistMessages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Sei un astrofisico. Rispondi in modo preciso e scientifico, usando terminologia tecnica. Mantieni la risposta in 3 frasi.",
    },
    {
      role: "user",
      content: userQuestion,
    },
  ];

  const scientistResponse = await chatCompletion(scientistMessages);
  console.log(scientistResponse);

  // ─── PERSONALITÀ 2: Smanettone nerd/geek ────────────────────────────
  console.log("\n🧠 SMANETTONE NERD/GEEK 👨‍💻");
  console.log("─".repeat(50));

  const nerdMessages: ChatMessage[] = [
    {
      role: "system",
      content:
        "Sei uno smanettone geek che spiega le cose in modo informale, come se fossimo al bar a parlare tra amici. Usa espressioni da nerd e meme. Mantieni la risposta in 3 frasi.",
    },
    {
      role: "user",
      content: userQuestion,
    },
  ];

  const nerdResponse = await chatCompletion(nerdMessages);
  console.log(nerdResponse);

  // ─── PERSONALITÀ 3: Nessun system prompt ────────────────────────
  // Senza system prompt, il modello usa il suo comportamento di default:
  // risponde in modo generico e "helpful".
  console.log("\n🤖 SENZA SYSTEM PROMPT (default)");
  console.log("─".repeat(50));

  const defaultMessages: ChatMessage[] = [
    {
      role: "user",
      content: userQuestion,
    },
  ];

  const defaultResponse = await chatCompletion(defaultMessages);
  console.log(defaultResponse);

  // ─── MULTI-TURN: MEMORIA TRAMITE MESSAGGI ──────────────────────
  // L'LLM è STATELESS. Per dargli "memoria" devi rimandare
  // i messaggi precedenti nell'array.
  console.log("\n\n💬 MULTI-TURN (conversazione con memoria)");
  console.log("═".repeat(50));

  // Partiamo con system + primo messaggio utente
  const conversation: ChatMessage[] = [
    {
      role: "system",
      content: "Sei un assistente conciso. Rispondi in 1-2 frasi.",
    },
    {
      role: "user",
      content: "Conosci il mio nome?.",
    },
  ];

  // ── TURNO 1: mandiamo il primo messaggio e otteniamo la risposta reale
  console.log(`👤 Turno 1: "${conversation[1].content}"`);
  const firstResponse = await chatCompletion(conversation);
  console.log(`🤖 Risposta 1: ${firstResponse}\n`);

  // Pushiamo la risposta REALE dell'assistant nell'array.
  // Questo è esattamente quello che fa ogni chat app:
  // salva la risposta e la rimanda al prossimo turno.
  conversation.push({
    role: "assistant",
    content: firstResponse,
  });

  // ── TURNO 2: aggiungiamo la domanda di verifica
  conversation.push({
    role: "user",
    content: "Il mio nome è Fabrizio",
  });

  console.log(`👤 Turno 2: "${conversation[conversation.length - 1].content}"`);
  const secondResponse = await chatCompletion(conversation);
  console.log(`🤖 Risposta 2: ${secondResponse}`);

  // Pushiamo anche la seconda risposta per avere la conversazione completa
  conversation.push({
    role: "assistant",
    content: secondResponse,
  });

  // Se risponde "Fabrizio", il modello ha LETTO il turno precedente
  // nell'array. Non lo "ricorda" — lo VEDE nei messaggi che gli passiamo.
  console.log("\n📋 Conversazione completa (5 messaggi):");
  console.log(JSON.stringify(conversation, null, 2));
}

main();
