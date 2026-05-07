/**
 * 01 — Embeddings Basics: Trasformare il testo in numeri
 * 
 * Un embedding è un array di numeri (vettore) che rappresenta 
 * il significato semantico di una frase. OpenAI usa vettori 
 * da 1536 dimensioni (per il modello text-embedding-3-small).
 */

-- 1. Abilitiamo l'estensione pgvector per gestire i vettori
create extension if not exists vector;

-- 2. Creiamo una tabella per i nostri documenti "vettorizzati"
create table if not exists documents (
  id bigserial primary key,
  content text,           -- Il testo originale (il "chunk")
  metadata jsonb,         -- Metadati extra (es. titolo, autore, pagina)
  embedding vector(1536)  -- Il vettore generato da OpenAI (1536 dimensioni per text-embedding-3-small)
);

-- 3. Creiamo una funzione per la ricerca per similarità (Similarity Search)
-- Questa funzione verrà chiamata dal nostro codice JS tramite supabase.rpc()
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity -- Calcolo della similarità del coseno
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;

-- Abilitiamo la sicurezza a livello di riga
alter table documents enable row level security;

-- Creiamo una "policy" che permette a chiunque di LEGGERE i documenti
create policy "Allow public read access"
  on documents for select
  using (true);
