/**
 * 04 — Vercel AI SDK: Embeddings & RAG (Retrieval-Augmented Generation)
 *
 * IL CONCETTO:
 * Gli LLM hanno una conoscenza "congelata" al momento del training.
 * Il RAG permette di iniettare "Conoscenza Privata" in tempo reale nel prompt,
 * pescandola da un database vettoriale (Supabase).
 *
 * IL WORKFLOW:
 * 1. Ingestion: Trasformiamo i documenti in vettori (Embeddings) e li salviamo su DB.
 * 2. Retrieval: Trasformiamo la domanda dell'utente in vettore e cerchiamo i documenti simili.
 * 3. Augmentation: Passiamo i documenti trovati all'AI per generare una risposta informata.
 */

// SQL DA ESEGUIRE SU SUPABASE:
// -- 1. Tabella per i documenti con supporto vettoriale
// create table if not exists public.documents (
//   id bigint primary key generated always as identity,
//   content text not null,
//   metadata jsonb,
//   embedding vector(1536) -- Per i modelli OpenAI
// );

// -- 2. Funzione per la ricerca di similarità (RPC)
// create or replace function match_documents (
//   query_embedding vector(1536),
//   match_threshold float,
//   match_count int
// )
// returns table (
//   id bigint,
//   content text,
//   metadata jsonb,
//   similarity float
// )
// language plpgsql
// as $$
// begin
//   return query
//   select
//     documents.id,
//     documents.content,
//     documents.metadata,
//     1 - (documents.embedding <=> query_embedding) as similarity
//   from documents
//   where 1 - (documents.embedding <=> query_embedding) > match_threshold
//   order by similarity desc
//   limit match_count;
// end;
// $$;

import "dotenv/config";
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    metadata: { source: "vercel-sdk-refactor", date: new Date().toISOString() },
  }));

  const { error } = await supabase.from("documents").insert(rows);
  if (error) {
    console.error(
      "❌ Errore durante l'inserimento dei dati su Supabase:",
      error,
    );
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
    match_count: 2, // Numero di risultati desiderati
  });

  if (error) {
    console.error("❌ Errore nella ricerca semantica:", error);
    return;
  }

  if (results && results.length > 0) {
    console.log("\n📄 Risultati trovati:");
    results.forEach((res: any, i: number) => {
      console.log(
        `${i + 1}. [Sim: ${res.similarity.toFixed(4)}] "${res.content}"`,
      );
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
  await searchKnowledge(
    "Come posso gestire gli agenti AI in modo semplice e interagendo con database vettoriali?",
  );

  console.log("\n🏁 Flusso terminato.");
}

main();
