import { ModelMessage } from "ai";

/**
 * Utility per recuperare una storia di chat simulata.
 */
export function getChatHistory(): ModelMessage[] {
  return [
    {
      role: "user",
      content: "Ciao, mi chiamo Fabrizio e amo il caffè espresso.",
    },
    {
      role: "assistant",
      content:
        "Piacere Fabrizio! L'espresso è una vera arte. Come posso aiutarti oggi?",
    },
    {
      role: "user",
      content:
        "Vorrei pianificare un viaggio in Brasile per vedere le piantagioni.",
    },
    {
      role: "assistant",
      content:
        "Il Brasile è il maggior produttore mondiale. Ti consiglio la regione di Minas Gerais.",
    },
    {
      role: "user",
      content:
        "Ottimo, ma prima dimmi: qual è la temperatura ideale dell'acqua per l'espresso?",
    },
    { role: "assistant", content: "Solitamente tra i 90°C e i 95°C." },
    { role: "user", content: "E quanto tempo deve durare l'estrazione?" },
  ];
}
