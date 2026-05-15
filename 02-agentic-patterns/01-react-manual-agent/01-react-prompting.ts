/**
 * 01 — ReAct Prompting: Insegnare all'AI a ragionare prima di agire
 * 
 * Il pattern ReAct (Reason + Act) consiste nello spingere l'LLM a seguire
 * un formato rigido di pensiero:
 * 
 * Thought: [Ragionamento dell'AI]
 * Action: [Nome della funzione da chiamare]
 * Action Input: [Parametri per la funzione]
 * Observation: [Risultato dell'azione - fornito da noi dopo l'esecuzione]
 * ... (ripete finché serve)
 * Final Answer: [Risposta finale per l'utente]
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── IL PROMPT REACT ───────────────────────────────────────────────
// Questo è il "cuore" dell'agente manuale. Spieghiamo all'AI le regole
// del gioco e quali strumenti ha a disposizione.
const SYSTEM_PROMPT = `
Sei un assistente logico che risolve problemi passo dopo passo.
Hai a disposizione i seguenti tool:

- calculate: esegue calcoli matematici. Input: una stringa matematica (es: "2 + 2").
- get_weather: recupera il meteo di una città. Input: nome della città.

Formato di risposta OBBLIGATORIO:

Thought: Ragiona su cosa devi fare.
Action: Il nome del tool da usare (calculate o get_weather).
Action Input: Il parametro da passare al tool.

Dopo che avrai ricevuto una 'Observation', valuta se hai finito o se serve un'altra azione.
Quando hai la risposta finale, scrivi:

Final Answer: La tua risposta finale chiara per l'utente.
`;

async function testPrompt() {
  console.log("🚀 Test del ReAct Prompting...\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "Quanto fa (25 * 4) + 10 e che tempo fa a Milano?" }
      ],
      temperature: 0, // Fondamentale: vogliamo precisione, non creatività
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log("🤖 Risposta dell'AI:");
  console.log("--------------------");
  console.log(content);
  console.log("--------------------");
  
  console.log("\n💡 Nota come l'AI si è fermata alla prima 'Action'.");
  console.log("Ora bisogna estrarre quel comando e inviarle l'Observation.");
}

testPrompt();
