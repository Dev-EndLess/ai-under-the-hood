/**
 * 04 — Persistent Memory (The "Long-term" Context)
 *
 * IL CONCETTO:
 * La summarization (Lab 03) è potente, ma se chiudiamo il programma, svanisce.
 * In questo lab usiamo Supabase per salvare il riassunto della conversazione.
 *
 * Quando l'utente torna, ricarichiamo il riassunto dal DB e l'AI
 * "si ricorda" magicamente di noi, anche senza avere l'intera storia dei messaggi.
 *
 * 💡 COME TESTARE QUESTO LAB:
 * 1. FASE 1 (Apprendimento): Decommenta 'msgPresentazione' e lancia il lab. 
 *    L'AI imparerà chi sei e salverà l'info nel DB.
 * 2. FASE 2 (Verifica): Commenta la fase 1, decommenta 'msgTest' e rilancia.
 *    L'AI ti riconoscerà pescando i dati da Supabase.
 * 3. RESET: Decommenta 'msgReset' per pulire il database e ricominciare da zero.
*/

// SQL DA ESEGUIRE SU SUPABASE:
// create table if not exists public.conversation_memory (
//   id uuid primary key default gen_random_uuid(),
//   user_id text unique not null,
//   summary text not null,
//   updated_at timestamp with time zone default now() -- NOTA: non si aggiorna da solo con l'upsert!
// );
// create index if not exists idx_user_id on public.conversation_memory(user_id);

import "dotenv/config";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";

// Setup Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const USER_ID = "fabrizio_001"; // Identificativo unico utente

/**
 * Carica la memoria compressa dal database
 */
async function loadMemory(userId: string): Promise<string | null> {
  console.log(`📡 [DB] Caricamento memoria per l'utente: ${userId}...`);
  const { data, error } = await supabase
    .from("conversation_memory")
    .select("summary")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data.summary;
}

/**
 * Salva o aggiorna la memoria compressa sul database
 */
async function saveMemory(userId: string, newSummary: string): Promise<void> {
  console.log(`💾 [DB] Salvataggio nuovo riassunto...`);
  const { error } = await supabase.from("conversation_memory").upsert(
    {
      user_id: userId,
      summary: newSummary,
      updated_at: new Date().toISOString(), // Aggiorniamo manualmente per precisione
    },
    { onConflict: "user_id" },
  );

  if (error) console.error("❌ Errore salvataggio:", error.message);
}

/**
 * Cancella la memoria dell'utente dal database
 */
async function clearMemory(userId: string): Promise<void> {
  console.log(`🗑️ [DB] Reset memoria per l'utente: ${userId}...`);
  const { error } = await supabase
    .from("conversation_memory")
    .delete()
    .eq("user_id", userId);

  if (error) console.error("❌ Errore reset:", error.message);
  else console.log("✅ Memoria resettata con successo.");
}

/**
 * Costruisce il System Prompt iniettando la memoria recuperata
 */
function buildSystemPrompt(memory: string | null): string {
  return `
    Sei un assistente personale intelligente. 
    Ecco le informazioni che ricordi dell'utente (Memoria a Lungo Termine):
    ---
    ${memory || "Non hai ancora nessuna informazione su questo utente. Sii accogliente ma ammetti di non conoscerlo."}
    ---
    Usa queste informazioni per personalizzare la risposta.
  `;
}

/**
 * Genera un nuovo riassunto consolidato usando l'AI
 */
async function generateUpdatedSummary(
  oldSummary: string | null,
  userMsg: string,
  aiMsg: string,
): Promise<string> {
  console.log("📝 [AI] Generazione riassunto aggiornato...");

  const systemPrompt =
    "Sei un esperto di gestione memoria. Il tuo compito è aggiornare la 'Memoria a Lungo Termine'. Unisci il vecchio riassunto con i nuovi fatti salienti (es. preferenze, nomi, interessi). Sii conciso.";

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    prompt: `
      VECCHIO RIASSUNTO: ${oldSummary || "Nessuno"}
      ULTIMO MESSAGGIO UTENTE: ${userMsg}
      ULTIMA RISPOSTA AI: ${aiMsg}
      
      Nuovo riassunto consolidato per il database:
    `,
  });

  return text;
}

async function main() {
  console.log("💾 CONTEXT ENGINEERING: Persistent Long-term Memory\n");

  // 1. Caricamento Memoria
  const oldSummary = await loadMemory(USER_ID);

  if (oldSummary) {
    console.log(`🧠 Memoria recuperata: "${oldSummary}"`);
  } else {
    console.log("🌑 Nuova sessione: nessuna memoria trovata su Supabase.");
  }

  // 2. Messaggio dell'utente (Decommenta uno dei tre per testare le diverse fasi per la momoria)
  const currentMessage = "Ciao! Mi chiamo Fabrizio e amo il caffè espresso. Ricordatelo!"; // FASE 1
  // const currentMessage = "Ciao! Ti ricordi come mi chiamo e cosa mi piace bere?";          // FASE 2
  // const currentMessage = "/reset";                                                       // RESET
  
  // LOGICA DI RESET: Se il messaggio è /reset, puliamo e usciamo
  if (currentMessage.trim().toLowerCase() === "/reset") {
    await clearMemory(USER_ID);
    return;
  }

  console.log(`\n👤 User: "${currentMessage}"`);

  // 3. Risposta dell'AI (Usa la memoria ricaricata)
  const { text: aiResponse } = await generateText({
    model: openai("gpt-4o-mini"),
    system: buildSystemPrompt(oldSummary),
    prompt: currentMessage,
  });

  console.log(`\n🤖 AI: ${aiResponse}`);

  // 4. Aggiornamento Memoria (Sempre attivo per questo lab)
  const updatedSummary = await generateUpdatedSummary(
    oldSummary,
    currentMessage,
    aiResponse,
  );
  console.log(`\n✨ Nuovo Riassunto Generato: "${updatedSummary}"`);

  // 5. Persistenza
  await saveMemory(USER_ID, updatedSummary);
  console.log("\n✅ Memoria aggiornata sul DB per la prossima sessione.");
}

main().catch(console.error);
