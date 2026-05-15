/**
 * 04 — The Agent Loop: Il cuore pulsante dell'Agente
 * 
 * Qui mettiamo tutto insieme in un ciclo ricorsivo.
 * L'agente continuerà a "pensare" e "agire" finché non avrà
 * una risposta finale.
 */

import "dotenv/config";
import { calculate, getWeather } from "./02-action-functions";
import { parseAction } from "./03-manual-parsing";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `
Sei un assistente logico. Risolvi problemi passo dopo passo usando i tool.

Tool disponibili:
- calculate: esegue calcoli. Input: stringa matematica.
- get_weather: meteo città. Input: nome città.

Formato:
Thought: [ragionamento]
Action: [tool]
Action Input: [input]
... (aspetta Observation)

Final Answer: [risposta finale]
`;

async function runAgent(query: string) {
  console.log(`\n🚀 AGENTE AVVIATO`);
  console.log(`❓ Domanda: ${query}\n`);

  // Cronologia dei messaggi che crescerà nel loop
  let messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: query }
  ];

  let iteration = 0;
  const MAX_ITERATIONS = 5; // Evitiamo loop infiniti se l'AI impazzisce

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    console.log(`--- Iterazione ${iteration} ---`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL,
        messages,
        temperature: 0,
      }),
    });

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    console.log(aiContent);

    // Controlliamo se l'AI ha dato la risposta finale
    if (aiContent.includes("Final Answer:")) {
      console.log("\n🎯 OBIETTIVO RAGGIUNTO!");
      return;
    }

    // Altrimenti, cerchiamo l'azione da compiere
    const { action, actionInput } = parseAction(aiContent);

    if (action && actionInput) {
      console.log(`\n⚙️  Eseguo: ${action}(${actionInput})...`);
      
      let observation = "";
      if (action === "calculate") observation = calculate(actionInput);
      if (action === "get_weather") observation = await getWeather(actionInput);

      console.log(`👁️  Observation: ${observation}\n`);

      // AGGIUNGIAMO TUTTO ALLA MEMORIA PER IL PROSSIMO CICLO
      messages.push({ role: "assistant", content: aiContent });
      messages.push({ role: "user", content: `Observation: ${observation}` });
    } else {
      console.log("\n⚠️ Non ho trovato azioni o risposte finali. Mi fermo.");
      break;
    }
  }
}

runAgent("Quanto fa (25 * 4) + 10 e che tempo fa a Milano?");
