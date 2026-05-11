/* 01-retrieval-routing.ts */
// --- DATA SOURCES ---
const documentationDB = [
  {
    topic: "installazione",
    content: "Per installare l'app, lancia 'npm install' nel terminale.",
  },
  {
    topic: "reset password",
    content: "La procedura di reset si trova in Impostazioni > Sicurezza.",
  },
];

const catalogDB = [
  {
    item: "Sottoscrizione Premium",
    price: "19€/mese",
    features: "Accesso illimitato.",
  },
  {
    item: "Sottoscrizione Basic",
    price: "Gratis",
    features: "Modelli base.",
  },
];

export { documentationDB, catalogDB };

/* 03-hybrid-search-agent.ts */
// --- DATABASE LOCALE (Dati riservati aziendali) ---
const localInventoryDB = [
  {
    model: "Intel Core i9-14900K",
    employeePrice: "250€-330€",
    stock: 12,
    notes:
      "Prezzo riservato ai dipendenti di AI-Under-The-Hood. Garanzia estesa inclusa.",
  },
  {
    model: "Intel Core i5-14600K",
    employeePrice: "180€-220€",
    stock: 25,
    notes: "Disponibile subito in ufficio a Pesaro.",
  },
  {
    model: "AMD Ryzen 9 9550X",
    employeePrice: "530-600€",
    stock: 18,
    notes: "Disponibile subito in ufficio a Pesaro.",
  },
  {
    model: "AMD Ryzen 7 9800X3D",
    employeePrice: "320€-350€",
    stock: 7,
    notes:
      "Prezzo riservato ai dipendenti di AI-Under-The-Hood. Garanzia estesa inclusa.",
  },
];

export { localInventoryDB };
