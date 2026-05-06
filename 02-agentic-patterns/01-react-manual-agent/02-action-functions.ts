/**
 * 02 — Action Functions: Gli "attrezzi" del nostro Agente
 * 
 * In questa sezione definiamo le funzioni JavaScript reali che verranno
 * eseguite quando l'agente emette un comando "Action".
 */

// ─── TOOL 1: CALCOLATRICE ──────────────────────────────────────────
// Semplice funzione che valuta un'espressione matematica.
export function calculate(expression: string): string {
  try {
    // Nota: in produzione NON usare eval(). Qui è per scopo didattico.
    // Usiamo una logica semplice per simulare un calcolo.
    const result = eval(expression);
    return `Risultato del calcolo: ${result}`;
  } catch (error) {
    return `Errore nel calcolo: ${expression}`;
  }
}

// ─── TOOL 2: METEO (REALE - Open-Meteo) ───────────────────────────
export async function getWeather(city: string): Promise<string> {
  try {
    // 1. Geocoding: trasformiamo il nome della città in coordinate (Lat/Lon)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=it&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData: any = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return `Errore: non ho trovato la città ${city}`;
    }

    const { latitude, longitude, name } = geoData.results[0];

    // 2. Weather: chiediamo il meteo reale per quelle coordinate
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData: any = await weatherRes.json();

    const temp = weatherData.current_weather.temperature;
    const wind = weatherData.current_weather.windspeed;

    return `Meteo a ${name}: ${temp}°C, vento a ${wind}km/h.`;
  } catch (error) {
    return `Errore nel recupero del meteo per ${city}.`;
  }
}

// ─── ESEMPIO DI UTILIZZO LOCALE ─────────────────────────────────────
// Questo file verrà importato nei laboratori successivi.
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🧪 Test locale delle funzioni:");
  console.log(calculate("25 * 4 + 10"));
  console.log(getWeather("Milano"));
  console.log(getWeather("Bologna"));
  console.log(getWeather("Roma"));
}
