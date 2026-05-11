/**
 * LOGICA DI RETE: Ricerca Web tramite Tavily
 */
async function webSearchWithTavily(query: string) {
  console.log(`📡 [Web] Eseguo ricerca reale per: "${query}"...`);

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: query,
      search_depth: "basic",
      max_results: 3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map((res: any) => ({
    title: res.title,
    content: res.content,
    url: res.url,
  }));
}

export { webSearchWithTavily };