/**
 * 03 — MCP Tools Orchestration
 * 
 * Questo lab dimostra il pattern di orchestrazione:
 * 1. Creazione tool e loop dell'agente.
 * 2. Bridge Pattern: Come mappare i tool scoperti via MCP dentro il Vercel AI SDK.
 * 3. Lifecycle Management: Uso del blocco 'finally' per garantire la chiusura dei 
 *    processi figli (MCP Servers) ed evitare perdite di memoria (memory leaks).
 */

import "dotenv/config";
import { generateText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Imports dalle Utils (Condivise)
import { setupMcpClient, createDiscountBridgeTool } from "./utils/mcp-helpers.js";

/**
 * LOGICA AGENTE: Esegue il loop di ragionamento
 */
async function runSalesAssistant(tools: any) {
  console.log("\n🤖 L'AI sta analizzando la richiesta con i tool MCP...");

  const systemPrompt = "Sei un assistente alle vendite gentile. Usa il calcolatore di sconti per dare risposte precise.";
  const userPrompt = "Un cliente vuole comprare una giacca da 150€. È un membro fedeltà. Qual è il prezzo finale?";
  
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    prompt: userPrompt,
    tools: tools,
    stopWhen: stepCountIs(5),
  });

  return text;
}

/**
 * MAIN: Orchestrazione dei passaggi
 */
async function main() {
  let mcpClient: Client | undefined;

  try {
    console.log("🧰 MCP: Avvio Orchestrazione Modulare (Versione con Utils)\n");

    // Passaggio 1: Connessione tramite Helper
    const mcpServerRoute = "./07-mcp-(model-context-protocol)/02-mcp-server.ts";
    mcpClient = await setupMcpClient(mcpServerRoute);
    console.log("✅ Server MCP Sconti connesso.");

    // Passaggio 2: Creazione del ponte Tools tramite Helper
    const tools = {
      getDiscount: createDiscountBridgeTool(mcpClient)
    };
    console.log("✅ Bridge Tools configurato.");

    // Passaggio 3: Esecuzione
    const response = await runSalesAssistant(tools);
    
    console.log(`\n🤖 Risultato finale:\n${response}`);
    console.log("\n✅ Lab completato con successo!");

  } catch (error) {
    console.error("❌ Errore durante l'orchestrazione:", error);
  } finally {
    if (mcpClient) {
      console.log("\n🔌 Chiusura connessione MCP...");
      await mcpClient.close();
    }
  }
}

main().catch(console.error);
