import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { tool } from "ai";
import { z } from "zod";
import type { CallToolResult, TextContent } from "@modelcontextprotocol/sdk/types.js";

/**
 * Helper per inizializzare la connessione a un server MCP tramite Stdio
 */
export async function setupMcpClient(serverPath: string) {
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", serverPath],
  });

  const client = new Client(
    { name: "mcp-helper-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  return client;
}

/**
 * Factory per creare il bridge verso il server degli sconti (Lab 03/04)
 */
export function createDiscountBridgeTool(mcpClient: Client) {
  return tool({
    description: "Calcola il prezzo finale scontato per un cliente tramite server MCP dedicato.",
    inputSchema: z.object({
      price: z.number(),
      isMember: z.boolean(),
    }),
    execute: async ({ price, isMember }) => {
      console.log(`📡 [Bridge] Chiamata MCP per sconto...`);
      const response = (await mcpClient.callTool({
        name: "calculate_discount",
        arguments: { price, isMember },
      })) as CallToolResult;
      return (response.content[0] as TextContent).text;
    },
  });
}
