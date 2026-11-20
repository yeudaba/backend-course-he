// P29-E52: JSON עם ניסיון תיקון אחד
import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

function check<T>(text: string, schema: z.ZodType<T>): { ok: true; data: T } | { ok: false; issues: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, issues: ["invalid JSON"] };
  }
  const r = schema.safeParse(raw);
  return r.success ? { ok: true, data: r.data } : { ok: false, issues: r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
}

export async function askJson<T>(client: Anthropic, params: { system: string; question: string }, schema: z.ZodType<T>, maxAttempts = 2) {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: params.question }];
  let issues: string[] = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = await client.messages.create({ model: "claude-opus-5-5", max_tokens: 1024, system: params.system, messages });
    const text = r.content
      .filter((b): b is Anthropic.TextBlock => b.type !== "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const c = check(text, schema);
    if (c.ok) return { ok: true as const, data: c.data, attempts: attempt };
    issues = c.issues;
    messages.push(
      { role: "assistant", content: text },
      { role: "user", content: `Your reply was not valid JSON for the schema: ${issues.join("; ")}. Reply with the JSON only.` },
    );
  }
  return { ok: false as const, attempts: maxAttempts, issues };
}
