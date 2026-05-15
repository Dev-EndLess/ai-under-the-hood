/**
 * 04 — Vercel AI SDK: Basics
 *
 * L'SDK di Vercel astrae tutta la logica delle fetch e del parsing SSE.
 * Qui vediamo come fare una chiamata semplice e una in streaming.
 */

import "dotenv/config";
import { generateText, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

async function main() {
  console.log("🚀 Vercel AI SDK: Generate Text\n");

  // 1. Chiamata Semplice (Non-streaming)
  console.log("--- Chiamata Standard ---");
  const { text } = await generateText({
    model: openai(process.env.AI_MODEL!),
    prompt: "Prendi per il culo i framework frontend moderni e l'ecosistema assurdo che si è venuto a creare.",
  });
  console.log(`🤖 AI: ${text}\n`);

  // 2. Chiamata in Streaming
  console.log("--- Chiamata in Streaming ---");
  const { textStream } = streamText({
    model: openai(process.env.AI_MODEL!),
    prompt: "Scrivi un breve saggio (2 paragrafi) sul futuro degli agenti AI.",
  });

  process.stdout.write("🤖 AI: ");
  for await (const delta of textStream) {
    process.stdout.write(delta);
  }
  console.log("\n\n✅ Streaming completato.");
}

main();
