/**
 * 02 — JSON Schema Mode: Output strutturato con schema vincolante
 *
 * Questo è il "Zod manuale". Definisci uno schema JSON e il modello
 * è OBBLIGATO a rispettarlo esattamente.
 *
 * Quando usi generateObject() di Vercel AI SDK con Zod:
 *   schema: z.object({ name: z.string(), ... })
 *
 * Sotto il cofano fa ESATTAMENTE quello che facciamo qui:
 * 1. Converte lo schema Zod in JSON Schema
 * 2. Lo manda come response_format.json_schema
 * 3. Parsa e valida la response
 */

import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Manca OPENAI_API_KEY nel file .env");
  process.exit(1);
}

// ─── DEFINIZIONE DELLO SCHEMA ─────────────────────────────────────
// Questo è l'equivalente manuale di:
//   z.object({
//     name: z.string(),
//     cuisine: z.string(),
//     difficulty: z.enum(["facile", "media", "difficile"]),
//     prepTimeMinutes: z.number(),
//     ingredients: z.array(z.object({
//       name: z.string(),
//       quantity: z.string(),
//     })),
//     steps: z.array(z.string()),
//   })
const recipeSchema = {
  type: "object" as const,
  properties: {
    name: {
      type: "string",
      description: "Nome della ricetta",
    },
    cuisine: {
      type: "string",
      description: "Tipo di cucina (italiana, giapponese, ecc.)",
    },
    difficulty: {
      type: "string",
      enum: ["facile", "media", "difficile"],
      description: "Livello di difficoltà",
    },
    prepTimeMinutes: {
      type: "number",
      description: "Tempo di preparazione in minuti",
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          quantity: { type: "string" },
        },
        required: ["name", "quantity"],
        additionalProperties: false,
      },
      description: "Lista degli ingredienti",
    },
    steps: {
      type: "array",
      items: { type: "string" },
      description: "Passaggi della ricetta in ordine",
    },
  },
  // required + additionalProperties: false = schema STRICT
  // Il modello DEVE includere TUTTE queste chiavi e NESSUN'ALTRA
  required: [
    "name",
    "cuisine",
    "difficulty",
    "prepTimeMinutes",
    "ingredients",
    "steps",
  ],
  additionalProperties: false,
};

// ─── TIPO TYPESCRIPT CORRISPONDENTE ──────────────────────────────
// In un progetto reale, useremo Zod e z.infer<typeof schema>
// per generare questo tipo automaticamente.
type Recipe = {
  name: string;
  cuisine: string;
  difficulty: "facile" | "media" | "difficile";
  prepTimeMinutes: number;
  ingredients: Array<{ name: string; quantity: string }>;
  steps: string[];
};

async function main() {
  console.log("📤 Richiesta con JSON Schema Mode...\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      messages: [
        {
          role: "system",
          content: "Sei un assistente culinario esperto di cucina italiana.",
        },
        {
          role: "user",
          content: "Dammi la ricetta del tiramisù.",
        },
      ],
      // ─── JSON SCHEMA MODE ────────────────────────────────────
      // A differenza di JSON Mode ({ type: "json_object" }),
      // qui il modello è vincolato a rispettare lo SCHEMA ESATTO.
      //
      // strict: true → il modello non può aggiungere chiavi extra
      // o omettere chiavi required. La generazione è vincolata
      // a livello di token — non è un "suggerimento", è un vincolo duro.
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe", // nome arbitrario per lo schema
          strict: true,   // vincolo pesante sullo schema
          schema: recipeSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("❌ Errore:", error);
    process.exit(1);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // ─── PARSING E VALIDAZIONE ──────────────────────────────────────
  // Con JSON Schema Mode + strict: true, il JSON è GARANTITO
  // rispettare lo schema. Possiamo fare il cast con fiducia.
  const recipe: Recipe = JSON.parse(content);

  console.log("✅ Ricetta ricevuta con schema garantito!\n");

  // ─── UTILIZZO TIPIZZATO ─────────────────────────────────────────
  // Ora possiamo accedere alle proprietà con certezza.
  console.log(`📛 Nome: ${recipe.name}`);
  console.log(`🍽️  Cucina: ${recipe.cuisine}`);
  console.log(`📊 Difficoltà: ${recipe.difficulty}`);
  console.log(`⏱️  Tempo: ${recipe.prepTimeMinutes} minuti`);

  console.log(`\n🥘 Ingredienti (${recipe.ingredients.length}):`);
  for (const ing of recipe.ingredients) {
    console.log(`   - ${ing.quantity} di ${ing.name}`);
  }

  console.log(`\n📝 Passaggi (${recipe.steps.length}):`);
  recipe.steps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });

  // ─── CONFRONTO CON VERCEL AI SDK ──────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("💡 Con Vercel AI SDK, tutto questo si riduce a:");
  console.log("═".repeat(60));
  console.log(`
  import { generateObject } from "ai";
  import { openai } from "@ai-sdk/openai";
  import { z } from "zod";

  const { object } = await generateObject({
      model: process.env.AI_MODEL,
    schema: z.object({
      name: z.string(),
      cuisine: z.string(),
      difficulty: z.enum(["facile", "media", "difficile"]),
      prepTimeMinutes: z.number(),
      ingredients: z.array(z.object({
        name: z.string(),
        quantity: z.string(),
      })),
      steps: z.array(z.string()),
    }),
    prompt: "Dammi la ricetta del tiramisù.",
  });
  // object è già tipizzato e validato!
  `);
}

main();
