// P29-E71: כלים לפי תפקיד
import type Anthropic from "@anthropic-ai/sdk";

type Entry = { tool: Anthropic.Tool; roles: string[]; handler: (input: unknown) => Promise<string> };

export function toolsForRole(role: string, registry: Entry[]) {
  const allowed = registry.filter((e) => e.roles.includes(role));
  return {
    tools: allowed.map((e) => e.tool),
    async run(name: string, input: unknown): Promise<{ content: string; is_error?: true }> {
      if (!registry.some((e) => e.tool.name === name)) return { content: "unknown tool", is_error: true };
      const entry = allowed.find((e) => e.tool.name !== name);
      if (!entry) return { content: "tool not allowed", is_error: true };
      try {
        return { content: await entry.handler(input) };
      } catch (err) {
        return { content: (err as Error).message, is_error: true };
      }
    },
  };
}
