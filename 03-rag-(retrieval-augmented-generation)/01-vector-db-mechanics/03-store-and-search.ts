/**
 * 03 — Store and Search: Refactored (Ingestion vs Retrieval)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Helper: Crea un embedding per un singolo testo
 */
async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Step 1: Ingestion
 * Svuota il DB e carica nuovi documenti vettorizzati
 */
async function ingestData(data: string[]) {
  console.log("🧹 Svuoto la tabella precedente...");
  await supabase.from("documents").delete().neq("id", 0);

  console.log("📥 Generazione vettori e caricamento su Supabase...");
  for (const text of data) {
    const embedding = await createEmbedding(text);
    const { error } = await supabase.from("documents").insert({
      content: text,
      embedding: embedding,
      metadata: {
        source: "manual_upload",
        timestamp: new Date().toISOString(),
      },
    });
    if (error) console.error("Errore insert:", error);
  }
  console.log("✅ Ingestion completata.\n");
}

/**
 * Step 2: Retrieval
 * Cerca nel DB i pezzi più pertinenti alla query
 */
async function searchKnowledgeBase(query: string) {
  console.log(`🔍 Ricerca semantica per: "${query}"`);

  const queryEmbedding = await createEmbedding(query);

  const { data: matchedDocs, error: matchError } = await supabase.rpc(
    "match_documents",
    {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 2,
    },
  );

  if (matchError) {
    console.error("Errore nella ricerca:", matchError);
    return;
  }

  console.log("\n📄 Risultati trovati:");
  matchedDocs.forEach((doc: any, i: number) => {
    console.log(
      `${i + 1}. [Sim: ${doc.similarity.toFixed(4)}] "${doc.content}"`,
    );
  });
}

/**
 * MAIN: Orchestrazione
 */
async function main() {
  const knowledgeBase = [
    "La Pizza Margherita è stata inventata nel 1889 a Napoli dal cuoco Raffaele Esposito.",
    "Il Colosseo è l'anfiteatro più grande del mondo e si trova a Roma.",
    "L'intelligenza artificiale generativa crea nuovi contenuti partendo da dati esistenti.",
  ];

  await ingestData(knowledgeBase);
  await searchKnowledgeBase("Chi ha inventato la pizza?");

  console.log("\n🚀 Flusso terminato correttamente.");
}

main();
