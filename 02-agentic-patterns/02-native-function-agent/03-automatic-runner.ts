/**
 * 03 — Automatic Runner: Il Motore Universale degli Agenti
 *
 * Questo file implementa un "Agent Runner" generico.
 * Puoi aggiungere quanti tool vuoi alla mappa `functionRegistry`,
 * e l'agente li userà automaticamente in un loop finché serve.
 * Chiamata AI -> Esecuzione Tool -> Feedback -> Ripete.
 */

import "dotenv/config";
import {
  calculate,
  getWeather,
} from "../01-react-manual-agent/02-action-functions";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── 1. REGISTRO DELLE FUNZIONI ───────────────────────────────────
// Mappiamo i nomi che conosce l'AI alle funzioni JS reali.
const functionRegistry: Record<string, Function> = {
  calculate: (args: { expression: string }) => calculate(args.expression),
  get_weather: async (args: { city: string }) => await getWeather(args.city),
  get_github_user_info: async (args: { username: string }) => {
    const headers = { "User-Agent": "NodeJS-App" };
    const userRes = await fetch(
      `https://api.github.com/users/${args.username}`,
      { headers },
    );
    const userData = await userRes.json();
    const reposRes = await fetch(
      `https://api.github.com/users/${args.username}/repos?sort=pushed&direction=desc&per_page=10`,
      { headers },
    );
    const reposData: any[] = await reposRes.json();
    const reposSummary = reposData.map((repo) => ({
      name: repo.name,
      language: repo.language,
      description: repo.description,
    }));

    return JSON.stringify({
      name: userData.name,
      username: userData.username,
      bio: userData.bio,
      email: userData.email,
      location: userData.location,
      linkedin_url: userData.linkedin_url,
      followers: userData.followers,
      following: userData.following,
      public_repos: userData.public_repos,
      recent_repositories: reposSummary,
    });
  },
};

// ─── 2. DEFINIZIONE DEI TOOL PER L'AI ─────────────────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Esegue calcoli matematici",
      parameters: {
        type: "object",
        properties: { expression: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Recupera il meteo di una città",
      parameters: { type: "object", properties: { city: { type: "string" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_user_info",
      description: "Recupera info e repo di un utente GitHub",
      parameters: {
        type: "object",
        properties: { username: { type: "string" } },
      },
    },
  },
];

// ─── 3. L'AGENT RUNNER (IL MOTORE) ────────────────────────────────
async function startAgent(prompt: string) {
  let messages: any[] = [{ role: "user", content: prompt }];
  let isRunning = true;

  console.log(`\n🚀 Agent in Action: "${prompt}"\n`);

  while (isRunning) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: process.env.AI_MODEL, messages, tools }),
    });

    const data = await response.json();
    const message = data.choices[0].message;

    // 1. Salviamo il messaggio dell'AI (fondamentale per lo stato!)
    messages.push(message);

    // 2. Controlliamo se l'AI ha chiesto dei tool
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const { name, arguments: rawArgs } = toolCall.function;
        const args = JSON.parse(rawArgs);

        console.log(`🛠️  Eseguo Tool: ${name}...`);
        const fn = functionRegistry[name];
        const result = fn ? await fn(args) : "Errore: Tool non trovato";

        // 3. Aggiungiamo il risultato alla cronologia
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }
    } else {
      // 4. Se non ci sono tool_calls, l'AI ha finito il lavoro
      console.log("\n🤖 RISPOSTA FINALE:");
      console.log("--------------------");
      console.log(message.content);
      console.log("--------------------\n");
      isRunning = false;
    }
  }
}

// TEST: Una domanda che richiede PIÙ tool (GitHub + Meteo)
startAgent(
  "Chi è l'utente 'dev-endless' su GitHub e che tempo fa nella sua città (Pesaro)?",
);
