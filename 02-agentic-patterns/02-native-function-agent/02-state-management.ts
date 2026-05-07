/**
 * 02 — State Management: Gestire la cronologia con dati REALI
 * 
 * Importante: Se l'AI chiede un tool, devi salvare nella cronologia:
 * 1. La richiesta dell'AI, quindi il messaggio dell'assistente (assistant + tool_calls)
 * 2. La tua risposta per ogni chiamata effettuata (tool + tool_call_id)
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ─── FUNZIONE PER GITHUB ────────────────────────────────────
async function getGithubUserInfo(username: string) {
  console.log(`   [Tool Execution] Recupero profilo e repo per: ${username}...`);
  
  const headers = { "User-Agent": "NodeJS-App" };
  
  // 1. Recuperiamo il profilo base
  const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
  const userData = await userRes.json();

  // 2. Recuperiamo gli ultimi 10 repository aggiornati
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=10`, { headers });
  const reposData: any[] = await reposRes.json();

  const reposSummary = reposData.map(repo => ({
    name: repo.name,
    language: repo.language,
    description: repo.description
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
    recent_repositories: reposSummary
  });
}

async function responseToJson(res: Response) {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function main() {
  console.log("📤 Avvio flusso completo con GitHub...\n");

  const tools = [{
    type: "function",
    function: {
      name: "get_github_user_info",
      description: "Recupera i dati pubblici di un utente GitHub",
      parameters: {
        type: "object",
        properties: { username: { type: "string" } },
        required: ["username"]
      }
    }
  }];

  let messages: unknown[] = [
    { role: "user", content: "Chi è l'utente github 'dev-endless' e quale stack tecnologico usa secondo le sue repo e infos?" }
  ];

  // --- STEP 1: L'AI chiede il tool ---
  const res1 = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, tools })
  });

  const data1 = await responseToJson(res1);
  const assistantMessage = data1.choices[0].message;

  console.log("1. L'AI ha chiesto il tool. Salvo la richiesta nella cronologia...");
  messages.push(assistantMessage); 

  if (assistantMessage.tool_calls) {
    const toolCall = assistantMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    // --- STEP 2: Eseguiamo la chiamata REALE ---
    const toolResult = await getGithubUserInfo(args.username);

    console.log("2. Ho ottenuto i dati. Li aggiungo come ruolo 'tool'...");
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult
    });

    // --- STEP 3: L'AI ora ha i dati e può rispondere ---
    console.log("3. Chiedo all'AI la risposta finale basata sui dati ricevuti...");
    const res2 = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages })
    });

    const data2 = await responseToJson(res2);
    console.log("\n🤖 RISPOSTA FINALE:");
    console.log("--------------------");
    console.log(data2.choices[0].message.content);
    console.log("--------------------");
  }
}

main();
