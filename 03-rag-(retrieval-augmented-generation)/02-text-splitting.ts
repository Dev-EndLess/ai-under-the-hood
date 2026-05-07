/**
 * 03 — Text Splitting: Rompere il testo in pezzi (Chunks)
 *
 * Per il RAG, non possiamo mandare testi troppo lunghi all'AI.
 * Dobbiamo dividerli in pezzi coerenti.
 */

function simpleSplit(text: string, chunkSize: number) {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    // Cerchiamo di tagliare dove c'è uno spazio per non rompere le parole
    let end = i + chunkSize;
    if (end < text.length) {
      const nextSpace = text.lastIndexOf(" ", end);
      if (nextSpace > i) {
        end = nextSpace;
      }
    }

    chunks.push(text.slice(i, end).trim());
    i = end;
  }

  return chunks;
}

// ESEMPIO CON TESTO LUNGO
const longText = `
L'intelligenza artificiale (IA) è una disciplina che studia se e in che modo si possano realizzare sistemi informatici intelligenti in grado di simulare la capacità e il comportamento del pensiero umano.
Il termine AI è stato coniato nel 1956, ma solo negli ultimi anni, grazie alla potenza di calcolo e ai Big Data, ha fatto passi da gigante.
Il RAG (Retrieval-Augmented Generation) è una tecnica che permette all'AI di consultare fonti esterne prima di rispondere, riducendo le allucinazioni e fornendo dati sempre aggiornati.
Questo processo si divide in tre fasi: indicizzazione, recupero e generazione.
`;

async function main() {
  console.log("✂️  Esempio di Text Splitting...\n");

  const chunks = simpleSplit(longText, 100); // Pezzi piccoli da 100 caratteri

  chunks.forEach((chunk, index) => {
    console.log(`Chunk ${index + 1}: [${chunk.length} caratteri]`);
    console.log(`"${chunk}"`);
    console.log("---");
  });

  console.log(`\n✅ Testo diviso in ${chunks.length} pezzi.`);
}

main();
