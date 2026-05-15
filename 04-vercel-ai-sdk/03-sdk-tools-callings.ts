/**
 * 03 — Vercel AI SDK: Tool Calling (Automated Agents)
 *
 * L'SDK gestisce il loop di esecuzione dei tool automaticamente
 * grazie alla proprietà `maxSteps`, rinominata recentemente in `stopWhen`.
 */

import "dotenv/config";
import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Simuliamo un database di prodotti
const products = [
  { id: "1", name: "Laptop Asus", price: 1200, stock: 5 },
  { id: "2", name: "Gaming Mouse", price: 35, stock: 0 },
  { id: "3", name: "4K Monitor", price: 600, stock: 12 },
];

async function main() {
  console.log("🚀 Vercel AI SDK: Automated Tool Calling\n");
  const systemPrompt = "Sei un assistente alle vendite. Aiuta l'utente a trovare i prodotti e controlla la disponibilità.";
  const userPrompt = "Vorrei comprare un Laptop Asus e un Mouse da Gaming. Sono disponibili? Quanto costano in totale?"

  const { text, steps } = await generateText({
    model: openai(process.env.AI_MODEL!),
    stopWhen: stepCountIs(5), // Il "motore" del loop automatico!
    system: systemPrompt,
    prompt: userPrompt,
    tools: {
      checkStock: tool({
        description: "Controlla il prezzo e la disponibilità di un prodotto",
        inputSchema: z.object({
          productName: z.string().describe("Il nome del prodotto da cercare"),
        }),
        execute: async ({ productName }) => {
          console.log(`[Tool] Eseguo checkStock per: ${productName}`);
          const product = products.find((p) =>
            p.name.toLowerCase().includes(productName.toLowerCase()),
          );
          return product
            ? { found: true, price: product.price, stock: product.stock }
            : { found: false };
        },
      }),
    },
  });

  console.log(`\n🤖 RISPOSTA FINALE: ${text}`);

  // Vediamo quante "iterazioni" ha fatto l'agente
  console.log(`\n📊 Numero di iterazioni: ${steps.length}`);
}

main();
