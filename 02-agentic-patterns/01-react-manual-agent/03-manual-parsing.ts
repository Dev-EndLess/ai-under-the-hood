/**
 * 03 — Manual Parsing: Estrarre comandi dal testo dell'AI
 * 
 * In questa sezione scriviamo la logica per "leggere" la risposta dell'AI
 * e capire quale funzione chiamare e con quali parametri.
 */

/**
 * Funzione di parsing che cerca i pattern:
 * Action: [nome]
 * Action Input: [parametro]
 */
export function parseAction(text: string): { action: string | null; actionInput: string | null } {
  // Regex per trovare l'azione e l'input
  // /Action:\s*(.*)/i cerca "Action: " seguito da qualsiasi testo
  const actionMatch = text.match(/Action:\s*(.*)/i);
  const actionInputMatch = text.match(/Action Input:\s*(.*)/i);

  return {
    action: actionMatch ? actionMatch[1].trim() : null,
    actionInput: actionInputMatch ? actionInputMatch[1].trim() : null
  };
}

// ─── TEST LOCALE ───────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const mockAiResponse = `
    Thought: Devo calcolare il totale.
    Action: calculate
    Action Input: "10 + 5"
  `;

  const parsed = parseAction(mockAiResponse);
  
  console.log("🔍 Test di parsing:");
  console.log("Testo originale:", mockAiResponse);
  console.log("Risultato:", parsed);
  
  if (parsed.action === "calculate") {
    console.log("\n✅ Successo! Il codice ha capito che deve calcolare.");
  }
}
