/**
 * 01 — Embeddings Basics: Trasformare il testo in numeri
 * 
 * Un embedding è un array di numeri (vettore) che rappresenta 
 * il significato semantico di una frase. OpenAI usa vettori 
 * da 1536 dimensioni (per il modello text-embedding-3-small).
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function createEmbedding(text: string) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function main() {
  console.log("📐 Generazione di Embeddings...\n");

  const phrase1 = "Il cane insegue il gatto";
  const phrase2 = "Un canide sta inseguendo un felino";
  const phrase3 = "Il meteo oggi è soleggiato";

  const emb1 = await createEmbedding(phrase1);
  const emb2 = await createEmbedding(phrase2);
  const emb3 = await createEmbedding(phrase3);

  console.log(`Testo: "${phrase1}"`);
  console.log(`Vettore (primi 5 numeri): [${emb1.slice(0, 5)}...]\n`);
  console.log(`Testo: "${phrase2}"`);
  console.log(`Vettore (primi 5 numeri): [${emb2.slice(0, 5)}...]\n`);
  console.log(`Testo: "${phrase3}"`);
  console.log(`Vettore (primi 5 numeri): [${emb3.slice(0, 5)}...]\n`);

  // Funzione per calcolare la similarità tra due vettori (Cosine Similarity)
  // Più il risultato è vicino a 1, più le frasi sono simili.
  function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      mA += vecA[i] * vecA[i];
      mB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
  }

  console.log(`Similarità tra phrase1 e phrase2: ${cosineSimilarity(emb1, emb2).toFixed(4)} (Molto alta!)`);
  console.log(`Similarità tra phrase1 e phrase3: ${cosineSimilarity(emb1, emb3).toFixed(4)} (Molto bassa!)`);
}

main();
