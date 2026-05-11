/**
 * 03 — Hybrid Search Agent (The Hybrid Agent)
 *
 * IL CONCETTO:
 * L'agente combina la conoscenza privata (Database Interno) con la
 * conoscenza globale (Web Search) per fornire risposte comparative impossibili
 * da ottenere con un solo strumento.
 *
 * SCENARIO:
 * Un dipendente vuole sapere se gli conviene comprare un processore Intel dal
 * magazzino aziendale (prezzo scontato) o se conviene prendere l'ultimo modello
 * AMD su internet.
 */

import "dotenv/config";
import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getCurrentDate } from "./utils/get-current-date";
import { localInventoryDB } from "./utils/mock-db-data";
import { webSearchWithTavily } from "./utils/web-search-tool";

/**
 * LOGICA AGENTICA: Orchestrazione Ibrida
 */
async function runHybridAgent(userQuery: string) {
  const systemPrompt = `
      Sei un assistente tecnico esperto di hardware per i dipendenti di AI-Under-The-Hood.
      DATA CORRENTE: ${getCurrentDate()}.

      STRATEGIA DI RICERCA:
      1. Se la domanda riguarda i NOSTRI prezzi interni o scorte di magazzino (es. i9-14900K, i5-14600K, Ryzen 7 9800X3D) -> Usa 'searchLocalInventory'.
      2. Se la domanda riguarda prezzi di mercato, recensioni o modelli non presenti in magazzino -> Usa 'webSearch'.
      3. Per ogni confronto, calcola il risparmio effettivo tra il prezzo aziendale e quello trovato sul Web.
    `;

  const { text, steps } = await generateText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    system: systemPrompt,
    prompt: userQuery,
    tools: {
      searchLocalInventory: tool({
        description:
          "Cerca i prezzi scontati per i dipendenti e la disponibilità in magazzino",
        inputSchema: z.object({
          processorModel: z
            .string()
            .describe(
              "Il modello del processore da cercare nel database aziendale",
            ),
        }),
        execute: async ({ processorModel }) => {
          console.log(
            `🏠 [RAG] Cerco nel magazzino interno per: "${processorModel}"...`,
          );

          const results = localInventoryDB.filter((item) =>
            item.model.toLowerCase().includes(processorModel.toLowerCase()),
          );

          return JSON.stringify(
            results.length > 0
              ? results
              : "Prodotto non presente nel magazzino interno.",
          );
        },
      }),
      webSearch: tool({
        description:
          "Cerca prezzi di mercato, benchmark e recensioni su internet",
        inputSchema: z.object({
          parameterQuery: z.string().describe("La query di ricerca per il web"),
        }),
        execute: async ({ parameterQuery }) => {
          try {
            const results = await webSearchWithTavily(parameterQuery);
            return JSON.stringify(results);
          } catch (error) {
            console.error("❌ Errore ricerca web:", error);
            return "Errore: ricerca web non disponibile.";
          }
        },
      }),
    },
  });

  return { text, steps };
}

/**
 * MAIN
 */
async function main() {
  console.log("🦾 THE HYBRID AGENT: Recupero dati dal web o dal database...\n");

  if (!process.env.TAVILY_API_KEY) {
    console.error(
      "⚠️ Attenzione: TAVILY_API_KEY mancante. La ricerca web fallirà.",
    );
  }

  // Esempio di query ibrida reale
  const query =
    "Confronta il prezzo del nostro Ryzen 7 9800X3D in magazzino con il prezzo attuale su internet. Mi conviene prenderlo in ufficio?";
  console.log(`👤 User: "${query}"\n`);

  const { text, steps } = await runHybridAgent(query);

  console.log(`\n🤖 AI: ${text}`);
  console.log(`\n📊 Numero di iterazioni (Steps): ${steps.length}`);
}

main().catch(console.error);
