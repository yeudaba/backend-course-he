// P29.5-E50: כמה שרתים, שמות בלי התנגשות
import type Anthropic from "@anthropic-ai/sdk";

type ServerTools = { prefix: string; tools: { name: string; description?: string; inputSchema: Record<string, unknown> }[] };

export function mergeTools(servers: ServerTools[]) {
  const routes = new Map<string, { prefix: string; tool: string }>();
  const tools: Anthropic.Tool[] = [];
  for (const s of servers) {
    if (!/^[a-z][a-z0-9]*$/.test(s.prefix)) throw new Error(`prefix לא חוקי: ${s.prefix}`);
    for (const t of s.tools) {
      const name = `${s.prefix}_${t.name}`;

      if (routes.has(name)) throw new Error(`שם כפול: ${name}`);
      routes.set(name, { prefix: s.prefix, tool: t.name });
      const { $schema, ...schema } = t.inputSchema;
      tools.push({ name, description: t.description ?? "", input_schema: schema as Anthropic.Tool.InputSchema });
    }
  }
  return { tools, route: (name: string) => routes.get(name) ?? null };
}
