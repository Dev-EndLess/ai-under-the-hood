/**
 * 01 — Function Calling (Web Search)
 * 
 * L'LLM non può navigare su internet, ma può "chiamare" delle funzioni
 * che noi gli mettiamo a disposizione.
 * 
 * Flusso:
 * 1. Mandiamo la domanda + la descrizione del Tool all'AI.
 * 2. Se l'AI capisce che le serve il Tool, ci risponde con "tool_calls" (non testo!).
 * 3. Noi eseguiamo la funzione reale nel nostro codice JS.
 * 4. Mandiamo il risultato della funzione all'AI.
 * 5. L'AI finalmente risponde all'utente usando i dati ottenuti.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── IL NOSTRO TOOL REALE (SIMULATO) ────────────────────────────────
// Qui potresti chiamare API reali come Tavily, Serper, o Google Search.
async function googleSearch(query: string) {
  console.log(`\n🔍 [Esecuzione Tool] Ricerca su Google per: "${query}"...`);
  
  // Simuliamo un database di conoscenza aggiornato
  const mockKnowledge: Record<string, string> = {
    "prezzi schede video nvidia rtx 5080": "I prezzi partono da circa 1200 euro, fino a salire a circa € 2000.",
    "prezzo bitcoin oggi": "Circa 65.000 USD.",
    "meteo milano": "Soleggiato, 22°C."
  };

  const result = mockKnowledge[query.toLowerCase()] || "Nessun risultato trovato su internet.";
  return JSON.stringify({ result });
}

// ─── LOGICA PRINCIPALE ──────────────────────────────────────────────
async function main() {
  const userMessage = "Prezzi schede video nvidia rtx 5080?";
  
  console.log(`\n👤 Utente: ${userMessage}`);

  // 1. Definiamo i tool che l'AI può usare
  const tools = [
    {
      type: "function",
      function: {
        name: "google_search",
        description: "Cerca informazioni aggiornate su internet (es. news, meteo, prezzi)",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "La query di ricerca da inviare a Google",
            },
          },
          required: ["query"],
        },
      },
    },
  ];

  const messages: any[] = [
    { role: "user", content: userMessage }
  ];

  // 2. Prima chiamata: chiediamo all'AI cosa vuole fare
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      tools, // Passiamo i tool disponibili
      tool_choice: "auto",
    }),
  });

  const data = await response.json();
  console.log('Risposta:', data);
  const message = data.choices[0].message;

  // 3. Verifichiamo se l'AI vuole chiamare un tool
  if (message.tool_calls) {
    const toolCall = message.tool_calls[0];
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);

    console.log(`🤖 L'AI ha deciso di usare il tool: ${functionName}`);

    if (functionName === "google_search") {
      // Eseguiamo la funzione reale
      const searchResult = await googleSearch(args.query);

      // 4. Mandiamo il risultato indietro all'AI
      // Dobbiamo aggiungere sia la richiesta del tool che il risultato alla history
      messages.push(message); // La richiesta del modello
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: searchResult,
      });

      // 5. Seconda chiamata: l'AI elabora la risposta finale col dato ottenuto
      const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
        }),
      });

      const finalData = await secondResponse.json();
      console.log(`🤖 Risposta finale: ${finalData.choices[0].message.content}`);
    }
  } else {
    console.log(`🤖 Risposta diretta: ${message.content}`);
  }
}

main();
