/**
 * 03 — Context Compression (Trimming & Summarization)
 *
 * IL CONCETTO:
 * La memoria degli LLM è limitata (Context Window). Se la conversazione è troppo lunga,
 * il modello dimentica l'inizio o crasha.
 *
 * In questo lab implementiamo le due tecniche standard del settore:
 * 1. Trimming (Sliding Window): Manteniamo intatti solo gli ultimi N messaggi.
 * 2. Summarization: Riassumiamo i messaggi tagliati per non perdere la memoria storica.
 */

import "dotenv/config";
import { ModelMessage, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getChatHistory } from "./utils/chat-history";

// Configurazione della finestra
const MAX_MESSAGES = 3; // Numero di messaggi "vivi" da mantenere

async function summarizeHistory(messages: ModelMessage[]): Promise<string> {
  console.log("📝 [Compression] Riassumendo i messaggi vecchi...");

  const systemPrompt =
    "Sei un assistente che riassume conversazioni. Crea un riassunto brevissimo (massimo 2 frasi) di ciò che è stato detto finora, mantenendo i fatti salienti.";

  const { text } = await generateText({
    model: openai(process.env.AI_MODEL!),
    system: systemPrompt,

    messages: messages,
  });

  return text;
}

async function main() {
  console.log("🪟 CONTEXT ENGINEERING: Sliding Window & Summarization\n");

  const chatHistory = getChatHistory();

  console.log(`📜 Storia totale: ${chatHistory.length} messaggi.`);

  // --- LOGICA DI COMPRESSIONE ---
  let summary = "";
  let activeMessages = chatHistory;

  if (chatHistory.length > MAX_MESSAGES) {
    const toSummarize = chatHistory.slice(0, chatHistory.length - MAX_MESSAGES);
    activeMessages = chatHistory.slice(chatHistory.length - MAX_MESSAGES);

    summary = await summarizeHistory(toSummarize);
  }

  console.log(`\n🧠 Memoria Compressa: "${summary}"`);
  console.log(`✅ Messaggi attivi inviati: ${activeMessages.length}`);

  const systemPrompt = `Sei un assistente personale. 
  Ecco un riassunto della conversazione precedente: ${summary}`;

  // --- RISPOSTA FINALE ---
  const { text } = await generateText({
    model: openai(process.env.AI_MODEL!),
    system: systemPrompt,
    messages: activeMessages,
  });

  console.log(`\n🤖 AI: ${text}`);
}

main().catch(console.error);
