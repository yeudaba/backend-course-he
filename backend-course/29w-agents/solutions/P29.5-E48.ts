// P29.5-E48: רק הכלים שאישרנו
type ToolsClient = {
  listTools(params?: { cursor?: string }): Promise<{ tools: { name: string }[]; nextCursor?: string }>;
  callTool(p: { name: string; arguments?: Record<string, unknown> }): Promise<{ content: unknown[]; isError?: boolean }>;
};

export function allowlist(client: ToolsClient, allowed: string[]): ToolsClient {
  const ok = new Set(allowed);
  return {
    async listTools() {
      const tools: { name: string }[] = [];
      let cursor: string | undefined;
      do {
        const page = await client.listTools(cursor ? { cursor } : {});
        tools.push(...page.tools.filter((t) => ok.has(t.name)));
        cursor = page.nextCursor;
      } while (cursor);
      return { tools };
    },
    async callTool(p) {
      if (!ok.has(p.name)) return { content: [{ type: "text", text: `tool not allowed: ${p.name}` }], isError: true };
      return client.callTool(p);
    },
  };
}
