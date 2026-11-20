// P29.5-E49: שרת MCP לשאלות נפוצות
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type Faq = { id: string; q: string; a: string };

export function createFaqMcpServer(faqs: Faq[]) {
  const server = new McpServer({ name: "faq", version: "1.0.0" });
  server.registerTool(
    "search_faq",
    {
      description: "Search the shop FAQ by free text. Returns up to `limit` matching questions with their answers, as JSON.",
      inputSchema: { query: z.string().min(2).max(100), limit: z.number().int().min(1).max(10).optional() },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit = 3 }) => {
      const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [])];
      const hits = faqs
        .map((f) => {
          const text = `${f.q} ${f.a}`.toLowerCase();
          return { f, score: words.filter((w) => text.includes(w)).length };
        })
        .filter((h) => h.score > 0)
        .sort((x, y) => y.score - x.score && (x.f.id < y.f.id ? -1 : x.f.id > y.f.id ? 1 : 0))
        .slice(0, limit)
        .map(({ f }) => ({ id: f.id, q: f.q, a: f.a }));
      return { content: [{ type: "text" as const, text: hits.length ? JSON.stringify(hits) : "no results" }] };
    },
  );
  return server;
}
