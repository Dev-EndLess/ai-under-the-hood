# 🔌 MCP — Model Context Protocol

In questo modulo esploriamo lo standard universale creato da Anthropic per permettere alle AI di interagire con qualsiasi strumento e risorsa in modo sicuro e standardizzato. Superiamo il concetto di "custom tools" per ogni modello, passando a un'architettura Client/Server universale.

## 📂 Laboratori

### [01-mcp-client-setup.ts](01-mcp-client-setup.ts)

**The Handshake**: Vediamo come inizializzare un Client MCP e come avviene il processo di "Discovery" per scoprire quali strumenti (tools) e risorse un server mette a disposizione tramite il trasporto Stdio.

### [02-mcp-server-setup.ts](02-mcp-server-setup.ts)

**Building the Server**: Costruiamo un server MCP che espone un tool di calcolo sconti dinamici. Vediamo come usare `McpServer` e `StdioServerTransport` per creare micro-servizi per l'AI.

### [03-mcp-tools-orchestration.ts](03-mcp-tools-orchestration.ts)

**Tool Mapping & Bridge**: Il ponte tra il protocollo MCP e il mondo Vercel AI SDK. Vediamo come mappare i tool remoti scoperti via MCP dentro il loop di un Agente, gestendo il lifecycle (connect/close) per evitare memory leaks.

### [04-mcp-full-agent.ts](04-mcp-full-agent.ts)

**Multi-Server Agent**: Il modulo finale dove creiamo un agente capace di orchestrare molteplici sorgenti esterne: tool locali (Node), API esterne (GitHub Search API) e tool remoti (il nostro server MCP).

---

## 📚 Risorse e Documentazione Ufficiale

- **[Sito Ufficiale MCP](https://modelcontextprotocol.io/)**: La documentazione principale del protocollo.
- **[MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)**: Repository ufficiale con esempi e documentazione tecnica per Node.js.
- **[MCP Server Directory](https://github.com/modelcontextprotocol/servers)**: Una collezione di server MCP pronti all'uso (PostgreSQL, Slack, GitHub, etc.).
- **[Vercel AI SDK - Tool Calling](https://sdk.vercel.ai/docs/foundations/tools)**: Come integrare strumenti esterni nel loop degli agenti.

---

## 🚀 Esecuzione

```bash
# Esegui l'handshake client-server
npm run 01:mcp-client-setup

# Lancia il server (solitamente lanciato dal client, ma utile per debug)
npm run 02:mcp-server-setup

# Lancia l'orchestratore modulare
npm run 03:mcp-tools-orchestration

# Lancia l'agente multi-server completo
npm run 04:mcp-full-agent
```
