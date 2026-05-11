/**
 * 02 — Web Search Agent (Breaking the Knowledge Cutoff)
 *
 * IL CONCETTO:
 * I modelli AI sono "congelati" nel tempo (Knowledge Cutoff). Non sanno cosa è successo
 * ieri a meno che non gli diamo gli strumenti per "guardare fuori". 
 * Questo agente usa una Search API per recuperare dati in tempo reale.
 * Grazie al websearch possiamo estendere la conoscenza dell'AI oltre il training data.
 * 
 */

import "dotenv/config";
import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * Helper per ottenere la data corrente formattata
 */
const getCurrentDate = () => {
  return new Date().toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Chiamata API a Tavily per fare una ricerca sul web (internet)
 */
async function webSearchWithTavily(query: string) {
  console.log(`📡 [Web] Eseguo ricerca reale per: "${query}"...`);

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic",
      max_results: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return data.results.map((res: any) => ({
    title: res.title,
    content: res.content,
    url: res.url
  }));
}

async function runSearchAgent(userQuery: string) {
  const systemPrompt = `
      Sei un assistente di ricerca aggiornato in tempo reale.
      DATA CORRENTE: ${getCurrentDate()}.
      Se l'utente ti chiede notizie recenti o fatti di attualità, DEVI usare 'webSearch'.
      Usa le informazioni trovate per comporre una risposta accurata e cita sempre le fonti (URL).
    `;

  const { text, steps } = await generateText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    system: systemPrompt,
    prompt: userQuery,
    tools: {
      webSearch: tool({
        description: "Cerca informazioni aggiornate su internet tramite Tavily Search API",
        inputSchema: z.object({
          parameterQuery: z.string().describe("La query di ricerca specifica"),
        }),
        execute: async ({ parameterQuery }) => {
          try {
            const results = await webSearchWithTavily(parameterQuery);
            return JSON.stringify(results);
          } catch (error) {
            console.error("❌ Errore durante la ricerca web:", error);
            return "Errore: Impossibile recuperare risultati dal web.";
          }
        },
      }),
    },
  });

  return { text, steps };
}

async function main() {
  console.log("🌐 WEB SEARCH AGENT (MODULAR): L'AI sta navigando...\n");

  if (!process.env.TAVILY_API_KEY) {
    console.error("❌ Errore: TAVILY_API_KEY mancante nel file .env");
    process.exit(1);
  }

  const query = "Quali sono le ultime novità degli ultimi mesi sulle schede video Nvidia?";
  console.log(`👤 User: "${query}"\n`);

  const { text, steps } = await runSearchAgent(query);

  console.log(`\n🤖 AI: ${text}`);
  console.log(`\n📊 Numero di iterazioni (Steps): ${steps.length}`);
}

main().catch(console.error);
