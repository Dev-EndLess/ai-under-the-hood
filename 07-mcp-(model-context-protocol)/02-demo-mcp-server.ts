import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

/**
 * 🛠️ MCP SERVER: Il "Fornitore di Strumenti"
 */
const server = new McpServer({
  name: "ai-under-the-hood-server",
  version: "1.0.0",
});

/**
 * 📌 REGISTRAZIONE TOOL: Calcolatore Sconti
 * Questo è un esempio reale: un'AI potrebbe usare questo tool
 * per fare un preventivo corretto a un cliente.
 */
server.registerTool(
  "calculate_discount",
  {
    description: "Calcola il prezzo scontato per un cliente",
    inputSchema: {
      price: z.number().describe("Il prezzo originale del prodotto"),
      isMember: z.boolean().describe("Se il cliente ha la tessera fedeltà"),
    },
  },
  async ({ price, isMember }) => {
    const DISCOUNT_RATE = 0.2; // 20% di sconto per i membri

    const discountAmount = isMember ? price * DISCOUNT_RATE : 0;
    const finalPrice = price - discountAmount;

    const savings = discountAmount;

    return {
      content: [
        {
          type: "text",
          text: isMember
            ? `Applicato sconto del 20%. Risparmio: €${savings.toFixed(2)}. Prezzo finale: €${finalPrice.toFixed(2)}.`
            : `Nessun sconto applicato. Prezzo finale: €${finalPrice.toFixed(2)}.`,
        },
      ],
    };
  },
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 MCP Server pronto su STDIO!");
}

runServer().catch(console.error);
