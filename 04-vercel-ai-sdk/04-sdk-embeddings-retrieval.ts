/**
 * 04 — Vercel AI SDK: Embeddings & RAG (Refactored)
 * 
 * Usiamo `embedMany` per l'ingestion massiva e `embed` per la ricerca.
 * Il codice è diviso in funzioni per modularità.
 */

import "dotenv/config";
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Funzione di Ingestion: Genera embeddings multipli e caricamento su Supabase
 */
async function ingestData(texts: string[]) {
  console.log("🧬 [Ingestion] Generazione embeddings multipla...");
  
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });

  console.log("🧹 [Ingestion] Pulizia tabella precedente...");
  await supabase.from("documents").delete().neq("id", 0);
  
  console.log("📥 [Ingestion] Caricamento nuovi dati...");
  const rows = texts.map((text, i) => ({
    content: text,
    embedding: embeddings[i],
    metadata: { source: "vercel-sdk-refactor", date: new Date().toISOString() }
  }));

  const { error } = await supabase.from("documents").insert(rows);
  if (error) {
    console.error("❌ Errore durante l'inserimento dei dati su Supabase:", error);
    return;
  }
  
  console.log("✅ Ingestion completata con successo.\n");
}

/**
 * Funzione di Retrieval: Cerca sul db di supabase la risposta più pertinente
 */
async function searchKnowledge(query: string) {
  console.log(`🔍 [Retrieval] Cerco informazioni per: "${query}"`);

  // Creiamo l'embedding per la query dell'utente
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: query,
  });

  // Chiamata alla funzione SQL su Supabase
  const { data: results, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: 0.3, // Soglia di similarità minima
    match_count: 2        // Numero di risultati desiderati
  });

  if (error) {
    console.error("❌ Errore nella ricerca semantica:", error);
    return;
  }

  if (results && results.length > 0) {
    console.log("\n📄 Risultati trovati:");
    results.forEach((res: any, i: number) => {
      console.log(`${i + 1}. [Sim: ${res.similarity.toFixed(4)}] "${res.content}"`);
    });
  } else {
    console.log("\n❌ Nessun documento pertinente trovato.");
  }
}

async function main() {
  console.log("🚀 Vercel AI SDK RAG Flow (Refactored)\n");

  const knowledgeBase = [
    "Next.js supporta il Server-Side Rendering (SSR) in modo nativo.",
    "Il Vercel AI SDK permette di gestire flussi agentici complessi con poche righe di codice.",
    "PostgreSQL con pgvector è una scelta eccellente per database vettoriali open-source.",
    "React è una libreria Javascript per la creazione di interfacce utente in Single Page Applications (SPA).",
  ];

  // Eseguiamo il caricamento
  await ingestData(knowledgeBase);

  // Eseguiamo una ricerca di test
  await searchKnowledge("Come posso gestire gli agenti AI in modo semplice e interagendo con database vettoriali?");

  console.log("\n🏁 Flusso terminato.");
}

main();
