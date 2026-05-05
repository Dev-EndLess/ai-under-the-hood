/**
 * 02 — Estimate Cost: Stima il costo in $ PRIMA di fare la chiamata
 *
 * Sapere quanto costa una chiamata API è fondamentale in produzione.
 * Con tiktoken (vedi 01-count-tokens.ts) conti i token localmente,
 * poi moltiplichi per il prezzo del modello.
 *
 * 💡 Nota: puoi stimare con precisione gli INPUT token (li conosci prima).
 * Per gli OUTPUT token puoi solo stimare basandoti su max_tokens o esperienza.
 */

import "dotenv/config";
import { encoding_for_model } from "tiktoken";

// ─── TABELLA PREZZI ────────────────────────────────────────────────
// Prezzi in $ per 1 MILIONE di token (aggiornati a Maggio 2025).
// ⚠️ I prezzi cambiano! Controlla: https://openai.com/api/pricing/
//
// In un progetto reale potresti mettere questa tabella in un file
// di configurazione o fetcharla da un endpoint.
const MODEL_PRICING: Record<
  string,
  { inputPerMillion: number; outputPerMillion: number }
> = {
  "gpt-4o": {
    inputPerMillion: 2.5,
    outputPerMillion: 10.0,
  },
  "gpt-4o-mini": {
    inputPerMillion: 0.15,
    outputPerMillion: 0.6,
  },
  "gpt-4.1": {
    inputPerMillion: 2.0,
    outputPerMillion: 8.0,
  },
  "gpt-4.1-mini": {
    inputPerMillion: 0.4,
    outputPerMillion: 1.6,
  },
  "gpt-4.1-nano": {
    inputPerMillion: 0.1,
    outputPerMillion: 0.4,
  },
};

// ─── FUNZIONE DI STIMA COSTO ──────────────────────────────────────
type CostEstimate = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  formatted: string;
};

function estimateCost(
  model: string,
  inputTokens: number,
  estimatedOutputTokens: number
): CostEstimate {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    throw new Error(
      `Modello "${model}" non trovato. Disponibili: ${Object.keys(MODEL_PRICING).join(", ")}`
    );
  }

  // Costo = (token / 1_000_000) * prezzo_per_milione
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost =
    (estimatedOutputTokens / 1_000_000) * pricing.outputPerMillion;
  const totalCost = inputCost + outputCost;

  return {
    model,
    inputTokens,
    outputTokens: estimatedOutputTokens,
    inputCost,
    outputCost,
    totalCost,
    formatted: `$${totalCost.toFixed(6)}`,
  };
}

// ─── ESPERIMENTI ────────────────────────────────────────────────────

const encoder = encoding_for_model("gpt-4o-mini");

console.log("💰 COST ESTIMATOR\n");
console.log("═".repeat(60));

// ─── Scenario 1: Singola domanda breve ──────────────────────────
const scenario1 = {
  system:
    "Sei un assistente utile. Rispondi in modo conciso.",
  user: "Qual è la capitale della Francia?",
  estimatedOutput: 20, // token di risposta stimati
};

const inputTokens1 =
  encoder.encode(scenario1.system).length +
  encoder.encode(scenario1.user).length +
  8; // overhead

console.log("\n📋 Scenario 1: Domanda breve");
console.log(`   System: "${scenario1.system}"`);
console.log(`   User: "${scenario1.user}"`);
console.log(`   Input tokens: ${inputTokens1}`);
console.log(`   Output stimati: ~${scenario1.estimatedOutput}`);

for (const model of Object.keys(MODEL_PRICING)) {
  const est = estimateCost(model, inputTokens1, scenario1.estimatedOutput);
  console.log(`   ${model.padEnd(16)} → ${est.formatted}`);
}

// ─── Scenario 2: Conversazione multi-turn ───────────────────────
const conversation = [
  {
    role: "system",
    content:
      "Sei un tutor di programmazione. Spiega i concetti con esempi di codice.",
  },
  { role: "user", content: "Cos'è una closure in JavaScript?" },
  {
    role: "assistant",
    content:
      "Una closure è una funzione che ricorda il suo scope lessicale anche quando viene eseguita fuori da esso. Ecco un esempio: function createCounter() { let count = 0; return function() { return ++count; }; } const counter = createCounter(); console.log(counter()); // 1",
  },
  { role: "user", content: "Puoi farmi un altro esempio più pratico?" },
];

const inputTokens2 = conversation.reduce((total, msg) => {
  return total + encoder.encode(msg.content).length + 4; // ~4 token overhead per messaggio
}, 0);

const estimatedOutput2 = 200; // risposta con codice = più lunga

console.log("\n📋 Scenario 2: Conversazione multi-turn (4 messaggi)");
console.log(`   Input tokens: ${inputTokens2}`);
console.log(`   Output stimati: ~${estimatedOutput2}`);

for (const model of Object.keys(MODEL_PRICING)) {
  const est = estimateCost(model, inputTokens2, estimatedOutput2);
  console.log(`   ${model.padEnd(16)} → ${est.formatted}`);
}

// ─── Scenario 3: Scala — 1000 richieste al giorno ──────────────
console.log("\n" + "═".repeat(60));
console.log("📊 SIMULAZIONE: 1000 richieste/giorno per 30 giorni\n");

const dailyRequests = 1000;
const days = 30;
const avgInputTokens = 500;
const avgOutputTokens = 300;

console.log(
  `   ${dailyRequests} richieste/giorno × ${days} giorni = ${(dailyRequests * days).toLocaleString()} chiamate`
);
console.log(
  `   Media: ${avgInputTokens} input + ${avgOutputTokens} output token per chiamata\n`
);

for (const model of Object.keys(MODEL_PRICING)) {
  const singleCost = estimateCost(model, avgInputTokens, avgOutputTokens);
  const monthlyCost = singleCost.totalCost * dailyRequests * days;
  console.log(
    `   ${model.padEnd(16)} → $${monthlyCost.toFixed(2)}/mese`
  );
}

// ─── Confronto con la chiamata reale ────────────────────────────
console.log("\n" + "═".repeat(60));
console.log("🔍 VERIFICA: Confronto stima vs costo reale\n");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (OPENAI_API_KEY) {
  const testMessages = [
    { role: "system", content: "Rispondi in una frase." },
    { role: "user", content: "Cos'è un token nell'ambito degli LLM?" },
  ];

  const estimatedInput = testMessages.reduce((total, msg) => {
    return total + encoder.encode(msg.content).length + 4;
  }, 0);

  console.log(`   Stima input: ~${estimatedInput} token`);

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: testMessages,
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();
    const usage = data.usage;

    console.log(`   Reale input:  ${usage.prompt_tokens} token`);
    console.log(`   Reale output: ${usage.completion_tokens} token`);

    const realCost = estimateCost(
      "gpt-4o-mini",
      usage.prompt_tokens,
      usage.completion_tokens
    );
    const estimatedCost = estimateCost("gpt-4o-mini", estimatedInput, 50);

    console.log(`\n   Costo stimato: ${estimatedCost.formatted}`);
    console.log(`   Costo reale:   ${realCost.formatted}`);
    console.log(
      `\n   💡 La differenza è dovuta all'overhead dei messaggi`
    );
    console.log(
      `   e alla stima degli output token (non li puoi sapere prima).`
    );
  }
} else {
  console.log("   ⏭️  Salta verifica reale (manca OPENAI_API_KEY)");
}

// Cleanup
encoder.free();
