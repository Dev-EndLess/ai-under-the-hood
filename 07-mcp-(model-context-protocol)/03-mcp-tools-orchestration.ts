/**
 * 03 — MCP Tools Orchestration
 * 
 * Questo lab dimostra il pattern di orchestrazione:
 * 1. Modularità: Funzioni separate per connessione, creazione tool e loop dell'agente.
 * 2. Bridge Pattern: Come mappare i tool scoperti via MCP dentro il Vercel AI SDK.
 * 3. Lifecycle Management: Uso del blocco 'finally' per garantire la chiusura dei 
 *    processi figli (MCP Servers) ed evitare perdite di memoria (memory leaks).
 * 
 * Esempio: Un assistente alle vendite che interroga un server MCP esterno per 
 * calcolare sconti dinamici in base alla membership del cliente.
 */

import "dotenv/config";
import { generateText, stepCountIs, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type {
  CallToolResult,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * 1. FUNZIONE DI CONNESSIONE
 * Gestisce l'avvio del server MCP e l'handshake iniziale.
 */
async function setupMcpClient(serverPath: string) {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", serverPath],
  });

  const client = new Client(
    { name: "orchestrator-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  return client;
}

/**
 * 2. FUNZIONE PER I TOOLS
 * Crea il ponte tra il protocollo MCP e il Vercel AI SDK.
 */
function createMcpBridgeTools(mcpClient: Client) {
  return {
    getDiscount: tool({
      description: "Calcola il prezzo finale scontato per un utente con la membership.",
      inputSchema: z.object({
        price: z.number().describe("Prezzo originale"),
        isMember: z.boolean().describe("Se l'utente è un membro fedeltà"),
      }),
      execute: async ({ price, isMember }) => {
        console.log(`📡 [Bridge] Chiamata MCP: calculate_discount per €${price}...`);
        
        const response = (await mcpClient.callTool({
          name: "calculate_discount",
          arguments: { price, isMember },
        })) as CallToolResult;

        return (response.content[0] as TextContent).text;
      },
    }),
  };
}

/**
 * 3. FUNZIONE DI ESECUZIONE AGENTE
 * Il loop di ragionamento dell'AI.
 */
async function runSalesAssistant(tools: ReturnType<typeof createMcpBridgeTools>) {
  console.log("\n🤖 L'AI sta analizzando la richiesta con i tool MCP...");

  const systemPrompt = "Sei un assistente alle vendite gentile. Usa il calcolatore di sconti per dare risposte precise."
  const userPrompt = "Un cliente vuole comprare una giacca da 150€. È un membro fedeltà. Qual è il prezzo finale?"
  
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
    console.log("🧰 MCP: Avvio Orchestrazione Modulare\n");

    // Passaggio 1: Connessione
    const mcpServerRoute = "./07-mcp-(model-context-protocol)/02-mcp-server.ts";
    mcpClient = await setupMcpClient(mcpServerRoute);
    console.log("✅ Server MCP Sconti connesso.");

    // Passaggio 2: Creazione del ponte Tools
    const tools = createMcpBridgeTools(mcpClient);
    console.log("✅ Bridge Tools configurato.");

    // Passaggio 3: Esecuzione
    const response = await runSalesAssistant(tools);
    
    console.log(`\n🤖 Risultato finale:\n${response}`);
    console.log("\n✅ Lab completato con successo!");

  } catch (error) {
    console.error("❌ Errore durante l'orchestrazione:", error);
  } finally {
    // Fondamentale per non lasciare processi appesi in memoria
    if (mcpClient) {
      console.log("\n🔌 Chiusura connessione MCP...");
      await mcpClient.close();
    }
  }
}

main().catch(console.error);
