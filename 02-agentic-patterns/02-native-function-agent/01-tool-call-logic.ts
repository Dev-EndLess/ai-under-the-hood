/**
 * 01 — Tool Call Logic: Gestire la risposta nativa dell'AI
 *
 * Esempio REALE: Chiedere informazioni aggiornate su un profilo GitHub.
 * L'AI non conosce i dati in tempo reale, quindi DEVE usare il tool.
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 1. Definiamo un tool che recupera dati da GitHub
const tools = [
  {
    type: "function",
    function: {
      name: "get_github_user_info",
      description:
        "Recupera i dati pubblici di un utente GitHub (bio, follower, repository pubblici)",
      parameters: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description: "Il nome utente GitHub (es: 'microsoft')",
          },
        },
        required: ["username"],
      },
    },
  },
];

const promptQuestion =
  "Chi è l'utente github 'dev-endless' e quali sono le sue ultime repo?";

async function main(promptQuestion: string) {
  console.log("📤 Chiedo all'AI informazioni su un utente GitHub...\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: promptQuestion }],
      tools,
      tool_choice: "auto",
    }),
  });

  const data = await response.json();
  const message = data.choices[0].message;

  if (message.tool_calls) {
    console.log("🤖 L'AI ha capito che non può sapere questa cosa a memoria!");
    console.log(
      "🔍 Sta richiedendo l'uso del tool per connettersi a internet.",
    );

    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    console.log("\n--- TOOL CALL DETECTED ---");
    console.log(`Funzione : ${toolCall.function.name}`);
    console.log(`Username : ${args.username}`);
    console.log("--------------------------");

    console.log(
      "\n💡 Ora il nostro codice dovrebbe chiamare: https://api.github.com/users/" +
        args.username,
    );
  } else {
    console.log("🤖 Risposta:", message.content);
  }
}

main(promptQuestion);
