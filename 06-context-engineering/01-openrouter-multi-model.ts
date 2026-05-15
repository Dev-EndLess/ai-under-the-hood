/**
 * 01 — OpenRouter & Multi-Model Setup
 * 
 * Il Context Engineering inizia con la scelta del modello. 
 * Modelli diversi hanno "finestre di contesto" diverse (es. 8k, 128k, 1M di token).
 * 
 * Usando OpenRouter come gateway, possiamo testare come lo stesso contesto 
 * viene gestito da cervelli diversi (GPT-4, Claude 3, Gemini, Llama) 
 * senza cambiare la struttura del codice.
 */

import "dotenv/config";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// 1. Configurazione di OpenRouter come provider OpenAI-compatible
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Funzione per testare modelli diversi con lo stesso prompt
 */
async function testModel(modelId: string, prompt: string) {
  console.log(`\n🤖 Testando Modello: [${modelId}]`);
  console.log(`---`);

  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      prompt: prompt,
      maxOutputTokens: 100,
    });

    console.log(`✨ Risposta: ${text.substring(0, 300)}`);
  } catch (error) {
    console.error(`❌ Errore con il modello ${modelId}:`, error);
  }
}

async function main() {
  console.log("🌐 CONTEXT ENGINEERING: Multi-Model Gateway via OpenRouter\n");

  if (!process.env.OPENROUTER_API_KEY) {
    console.error("⚠️ Errore: OPENROUTER_API_KEY mancante nel .env");
    return;
  }

  const prompt = "Spiegami brevemente cos'è una Context Window in ambito LLM.";

  // E' possibile alternare tra diversi modelli
  // Possiamo scegliere il modello giusto in base al carico di contesto
  const modelsList = [
    `openai/${process.env.AI_MODEL}`,          // Economico, finestra media
    "anthropic/claude-3-haiku",    // Veloce, ottima gestione contesto
    "anthropic/claude-opus-4.7",  // Il modello più grande con over 1M di token di contesto
  ];

  for (const modelId of modelsList) {
    await testModel(modelId, prompt);
  }

  console.log("\n✅ Gateway configurato correttamente.");
}

main().catch(console.error);
