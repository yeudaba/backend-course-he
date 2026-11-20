// P29.5-E34: כלים במקביל, עם timeout לכל כלי
import type Anthropic from "@anthropic-ai/sdk";

type Tool = { run(input: unknown): Promise<string> };
type Call = { id: string; name: string; input: unknown };

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export function runToolCalls(calls: Call[], tools: Record<string, Tool>, opts: { timeoutMs: number }) {
  return Promise.all(
    calls.map(async (c): Promise<Anthropic.ToolResultBlockParam> => {
      if (!Object.hasOwn(tools, c.name)) return { type: "tool_result", tool_use_id: c.id, content: `unknown tool: ${c.name}`, is_error: true };
      try {
        return { type: "tool_result", tool_use_id: c.id, content: await tools[c.name].run(c.input) };
      } catch (err) {
        const msg = (err as Error).message;
        return { type: "tool_result", tool_use_id: c.id, content: msg.startsWith("timeout after") ? msg : `שגיאה: ${msg}`, is_error: true };
      }
    }),
  );
}
