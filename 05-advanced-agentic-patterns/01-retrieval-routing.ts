/**
 * 01 — Retrieval Routing (Agentic Orchestration)
 *
 * IL CONCETTO:
 * In un sistema RAG (Retrieval-Augmented Generation) di grandi dimensioni, non è efficiente 
 * (né preciso) cercare in tutti i database contemporaneamente. Il "Routing" trasforma 
 * l'AI in un orchestratore dinamico che decide la "rotta" dell'informazione.
 *
 * I VANTAGGI DEL ROUTING:
 * 1. Efficienza: Interroghiamo solo la fonte necessaria, risparmiando tempo e token.
 * 2. Precisione: Evitiamo il "rumore" di dati irrilevanti provenienti da altre fonti.
 * 3. Scalabilità: Possiamo aggiungere decine di database diversi (FAQ, Manuali, Prodotti, Web) 
 *    e lasciare che l'agente scelga quello giusto.
 *
 * COSA SUCCEDE SOTTO IL COFANO:
 * - Intent Classification: L'LLM analizza la domanda dell'utente.
 * - Tool Selection: In base alla descrizione dei tool, l'LLM decide quale attivare.
 * - Loop Decisionale: Grazie a 'stopWhen', l'agente può fare più tentativi se la prima fonte non basta.
 */

import "dotenv/config";
import { generateText, tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// --- DATA SOURCES ---
const documentationDB = [
  {
    topic: "installazione",
    content: "Per installare l'app, lancia 'npm install' nel terminale.",
  },
  {
    topic: "reset password",
    content: "La procedura di reset si trova in Impostazioni > Sicurezza.",
  },
];

const catalogDB = [
  {
    item: "Sottoscrizione Premium",
    price: "19€/mese",
    features: "Accesso illimitato.",
  },
  { 
    item: "Sottoscrizione Basic", 
    price: "Gratis", 
    features: "Modelli base." 
  },
];

async function main() {
  console.log("🧭 AGENTIC ROUTING: L'AI sta decidendo la rotta migliore...\n");

  const systemPrompt = `
      Sei un assistente di supporto intelligente. 
      Usa 'searchCatalog' per prezzi/abbonamenti.
      Usa 'searchDocumentation' per installazione/errori.
    `;
  
  const userQuery = "Quanto costa l'abbonamento premium e cosa include?";
  console.log(`👤 User: "${userQuery}"\n`);

  const { text, steps } = await generateText({
    model: openai("gpt-4o-mini"),
    stopWhen: stepCountIs(5),
    system: systemPrompt,
    prompt: userQuery,
    tools: {
      searchDocumentation: tool({
        description: "Cerca informazioni tecniche e guide all'uso",
        inputSchema: z.object({
          parameterQuery: z.string(),
        }),
        execute: async ({ parameterQuery }) => {
          console.log(`🛠️  [Router] -> Scelta: DOCUMENTAZIONE | Filtro: "${parameterQuery}"`);
          
          const results = documentationDB.filter(doc => 
            doc.topic.toLowerCase().includes(parameterQuery.toLowerCase()) ||
            doc.content.toLowerCase().includes(parameterQuery.toLowerCase())
          );

          return JSON.stringify(results.length > 0 ? results : documentationDB);
        },
      }),
      searchCatalog: tool({
        description: "Cerca prezzi e listini abbonamenti",
        inputSchema: z.object({
          parameterQuery: z.string(),
        }),
        execute: async ({ parameterQuery }) => {
          console.log(`💰 [Router] -> Scelta: CATALOGO | Filtro: "${parameterQuery}"`);
          
          const results = catalogDB.filter(item =>
            item.item.toLowerCase().includes(parameterQuery.toLowerCase()) ||
            item.features.toLowerCase().includes(parameterQuery.toLowerCase())
          );

          return JSON.stringify(results.length > 0 ? results : catalogDB);
        },
      }),
    },
  });

  console.log(`\n🤖 AI: ${text}`);
  console.log(`\n📊 Numero di iterazioni (Steps): ${steps.length}`);
}

main().catch(console.error);
