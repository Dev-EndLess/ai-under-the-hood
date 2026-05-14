import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * 🔌 MCP CLIENT: L' "Orchestratore"
 * 
 * Il client è l'entità che ha bisogno di strumenti (es. un'interfaccia chat 
 * o un agente AI). Si connette a uno o più server per espandere le sue capacità.
 */
async function main() {
  console.log("🔌 MCP: Inizializzazione Client Reale (v1 SDK)\n");

  /**
   * 1. CONFIGURAZIONE TRASPORTO
   * Il client lancia il server come processo figlio. 
   * La comunicazione avviene tramite 'stdio' (standard input/output).
   */
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "./07-mcp-(model-context-protocol)/00-demo-mcp-server.ts"],
  });

  const client = new Client(
    {
      name: "ai-under-the-hood-client",
      version: "1.0.0",
    },
    { capabilities: {} },
  );

  try {
    console.log("📡 Connessione al server...");
    await client.connect(transport);
    console.log("✅ Connessione stabilita!\n");

    /**
     * 2. DISCOVERY DEI TOOL
     * Chiediamo al server: "Cosa sai fare?". 
     * Il server risponde con la lista di tool che abbiamo registrato prima.
     */
    console.log("🔍 Discovery dei tool...");
    const response = await client.listTools();
    console.table(response.tools);

    // 3. ESECUZIONE (CALL)
    // Invochiamo il tool passandogli i parametri richiesti. 
    // La richiesta viaggia su STDIO, il server la elabora e ci rimanda il risultato.
    console.log("\n🧪 Test call tool 'calculate_discount'...");
    const result = await client.callTool({
      name: "calculate_discount",
      arguments: {
        price: 100,
        isMember: true
      }
    });

    console.log("📄 Risultato:", JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("❌ Errore:", error);
  }
}

main().catch(console.error);
