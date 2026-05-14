import { tool } from "ai";
import { z } from "zod";
/**
 * SORGENTE 1: Tool Nativo (Locale)
 */
const localTimeTool = tool({
  description: "Ottiene l'ora corrente del sistema.",
  inputSchema: z.object({}),
  execute: async () => new Date().toLocaleTimeString(),
});


export { localTimeTool };
