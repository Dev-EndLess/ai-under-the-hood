# 03 — Structured Output

## Il problema

Gli LLM restituiscono testo libero. Ma spesso ti serve **JSON strutturato** per processarlo nel codice downstream (salvare in DB, mandare a un'altra API, renderizzare in UI).

Se chiedi "dammi un JSON", a volte il modello ci aggiunge testo prima/dopo, o cambia le chiavi, o dimentica una virgola.

## Le soluzioni di OpenAI

### 1. JSON Mode (il modo "vecchio")

```typescript
response_format: {
  type: "json_object";
}
```

- ✅ Garantisce che l'output sia JSON valido
- ❌ NON garantisce quale sarà la struttura (chiavi, tipi)
- ⚠️ Devi specificare nel prompt cosa vuoi

### 2. JSON Schema Mode (il modo "nuovo" e migliore)

```typescript
response_format: {
  type: "json_schema",
  json_schema: {
    name: "recipe",
    strict: true,
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        ingredients: { type: "array", items: { type: "string" } }
      },
      required: ["name", "ingredients"],
      additionalProperties: false
    }
  }
}
```

- ✅ Garantisce JSON valido
- ✅ Garantisce che lo schema sia rispettato ESATTAMENTE
- ✅ Il modello è vincolato a livello di generazione (non è un "suggerimento")

## Il collegamento con Zod e Vercel AI SDK

Quando usi `generateObject()` di Vercel AI SDK con uno schema Zod:

```typescript
// Quello che SCRIVI con Vercel AI SDK
const result = await generateObject({
  model: openai("gpt-4o-mini"),
  schema: z.object({
    name: z.string(),
    ingredients: z.array(z.string()),
  }),
  prompt: "Dammi una ricetta per la pasta con il pesto",
});
```

Sotto il cofano, l'SDK:

1. Converte lo schema Zod in JSON Schema
2. Lo manda come `response_format.json_schema`
3. Parsa e valida la response

Nei file di questa sezione facciamo i passaggi 2 e 3 **a mano**.

## Cosa imparare qui

- **01-json-mode.ts** — `response_format: { type: "json_object" }` — il modo base.
- **02-json-schema.ts** — `response_format: { type: "json_schema" }` — lo schema vincolante.

## 📖 Docs

- [Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
