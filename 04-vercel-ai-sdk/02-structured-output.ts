/**
 * 02 — Vercel AI SDK: Structured Output
 *
 * Usiamo `generateObject` per ottenere dati strutturati e tipizzati
 * direttamente dall'AI, senza dover fare il parsing manuale del JSON.
 */

import "dotenv/config";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

async function main() {
  console.log("🚀 Vercel AI SDK: Structured Output (Zod)\n");

  // Definizione dello schema con Zod
  const recipeSchema = z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        }),
      ),
      steps: z.array(z.string()),
      difficulty: z.enum(["facile", "media", "difficile"]),
    }),
  });

  console.log("👨‍🍳 Generazione di una ricetta strutturata...");

  const lasagnaPrompt = `
  Genera una ricetta per la lasagna al ragù autentica.`;
  const spaghettiPrompt = "Genera una ricetta per la pasta al pomodoro (spaghetti).";

  const { output } = await generateText({
    model: openai(process.env.AI_MODEL!),
    output: Output.object({ schema: recipeSchema }),
    prompt: lasagnaPrompt,
  });

  // Ora 'object' è perfettamente tipizzato secondo lo schema!
  console.log("\n--- RICETTA RICEVUTA ---");
  console.log(`Nome: ${output.recipe.name}`);
  console.log(`Difficoltà: ${output.recipe.difficulty}`);
  console.log("\nIngredienti:");
  output.recipe.ingredients.forEach((i) =>
    console.log(`- ${i.amount} di ${i.name}`),
  );

  console.log("\nProcedimento:");
  output.recipe.steps.forEach((s, i) => console.log(`${i + 1}. ${s}`));

  console.log("\n✅ Dati validati e pronti all'uso!");
}

main();
