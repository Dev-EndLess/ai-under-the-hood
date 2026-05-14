/**
 * 04 — The Multi-Server Agent
 * 
 * Un singolo agente AI che orchestra strumenti provenienti da:
 * 1. Native Tools (Locali - Sistema)
 * 2. Bridge Tools (Verso Server MCP reali - Sconti)
 * 3. External API Tools (Chiamate live - GitHub Search API)
 * 
 * Dimostra la scalabilità di MCP: un'unica interfaccia permette all'Agente 
 * di interagire con sistemi esterni al suo ecosistema.
 */

import "dotenv/config";
import { generateText, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Imports dalle Utils (Pattern modulare)
import { localTimeTool } from "./utils/local-time-tool.js";
import { setupMcpClient, createDiscountBridgeTool } from "./utils/mcp-helpers.js";

/**
 * FACTORY: Crea un tool REALE per cercare repository su GitHub
 */
function createGithubSearchTool() {
  return tool({
    description: "Cerca repository reali su GitHub tramite API pubblica.",
    inputSchema: z.object({ query: z.string().describe("La keyword da cercare") }),
    execute: async ({ query }) => {
      console.log(`🌐 [API Call] Ricerca live su GitHub per: "${query}"...`);
      
      try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=3`);
        
        if (!response.ok) return "Errore: Impossibile contattare GitHub al momento.";
        
        const data = (await response.json()) as any;
        const repos = data.items.map((repo: any) => `${repo.full_name} (⭐${repo.stargazers_count})`).join(", ");
        
        return repos.length > 0 
          ? `Repository trovate: ${repos}` 
          : "Nessun repository trovato per questa ricerca.";
      } catch (error) {
        return "Errore durante la ricerca su GitHub.";
      }
    },
  });
}

/**
 * LOGICA AGENTE: Esegue il loop di ragionamento
 */
async function runSupervisoryAgent(tools: any) {
  console.log("\n🤖 L'Agente Multi-Server sta ragionando...");

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `
      Sei un supervisore tecnico e commerciale. 
      Hai accesso a tool locali (ora), server MCP (sconti) e ricerche esterne (github).
      Usa i tool in sequenza per rispondere in modo completo.
    `,
    prompt: "Che ore sono? Un cliente vuole comprare un server da 500€ ed è membro fedeltà, quanto paga? E infine cercami dei repo su GitHub per TypeScript SDK for Model Context Protocol ufficiale.",
    tools: tools,
    stopWhen: stepCountIs(5),
  });

  return text;
}

/**
 * MAIN: Orchestrazione Multi-Sorgente
 */
async function main() {
  let discountMcpClient: Client | undefined;

  try {
    console.log("🌐 MCP: Avvio Agente Multi-Server (Modular Version)\n");

    // 1. Connessione ai Server MCP (Tramite Helper)
    discountMcpClient = await setupMcpClient("./07-mcp-(model-context-protocol)/02-mcp-server.ts");
    console.log("✅ Server Sconti (MCP) connesso.");

    // 2. Assemblaggio dei Tool da sorgenti diverse
    const agentTools = {
      getTime: localTimeTool,                            // Sorgente 1: Locale
      searchGit: createGithubSearchTool(),               // Sorgente 2: API Esterna (Real)
      getDiscount: createDiscountBridgeTool(discountMcpClient), // Sorgente 3: MCP Reale (Helper)
    };

    // 3. Esecuzione
    const finalResponse = await runSupervisoryAgent(agentTools);
    console.log(`\n🤖 AI RISPOSTA FINALE:\n${finalResponse}`);

  } catch (error) {
    console.error("❌ Errore:", error);
  } finally {
    if (discountMcpClient) {
      console.log("\n🔌 Spegnimento server MCP...");
      await discountMcpClient.close();
    }
    console.log("✅ Sessione terminata.");
  }
}

main().catch(console.error);
