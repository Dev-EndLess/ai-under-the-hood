/**
 * 04 — Chunk Overlap (Pro Text Splitting)
 *
 * L'overlap permette di mantenere il contesto tra un pezzo di testo e l'altro.
 * Senza overlap, se un'informazione importante è a cavallo tra due chunk,
 * l'AI potrebbe non capire il contesto completo.
 */

function splitWithOverlap(text: string, chunkSize: number, overlap: number) {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    // Prendiamo un pezzo di lunghezza chunkSize
    let end = start + chunkSize;
    let chunk = text.substring(start, end);

    chunks.push(chunk);

    // Il prossimo pezzo NON inizierà da dove è finito questo,
    // ma tornerà indietro di 'overlap' caratteri.
    start = start + (chunkSize - overlap);
  }

  return chunks;
}

const longTextPrompt = `L'intelligenza artificiale (IA) è una disciplina che studia se e in che modo si possano realizzare sistemi informatici intelligenti in grado di simulare la capacità e il comportamento del pensiero umano. Il termine AI è stato coniato nel 1956, ma solo negli ultimi anni, grazie alla potenza di calcolo e ai Big Data, ha fatto passi da gigante. Il RAG (Retrieval-Augmented Generation) è una tecnica che permette all'AI di consultare fonti esterne prima di rispondere, riducendo le allucinazioni e fornendo dati sempre aggiornati. Questo processo si divide in tre fasi: indicizzazione, recupero e generazione.`;

console.log("✂️  ESEMPIO DI CHUNK OVERLAP...\n");

const CHUNK_SIZE = 100;
const OVERLAP = 30; // 30 caratteri di "memoria" dal chunk precedente

const chunks = splitWithOverlap(longTextPrompt, CHUNK_SIZE, OVERLAP);

chunks.forEach((chunk, i) => {
  console.log(`Chunk ${i + 1}: [${chunk.length} caratteri]`);
  console.log(`"${chunk}"`);
  console.log("-".repeat(20));
});

console.log(
  `\n✅ Testo diviso in ${chunks.length} pezzi con ${OVERLAP} caratteri di sovrapposizione.`,
);
