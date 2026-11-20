// P29-E32: סיכום שלא נחתך
import type Anthropic from "@anthropic-ai/sdk";

const SYSTEM = "Summarize the user's text in Hebrew, in at most three short sentences.";

export async function summarize(client: Anthropic, text: string, opts: { maxTokens?: number } = {}) {
  const first = opts.maxTokens ?? 1024;
  const call = (maxTokens: number) =>
    client.messages.create({ model: "claude-opus-5-5", max_tokens: maxTokens, system: SYSTEM, messages: [{ role: "user", content: text }] });

  let r = await call(first);
  let attempts = 1;
  if (r.stop_reason === "max_tokens") {
    r = await call(first * 2);
    attempts = 2;
  }
  if (r.stop_reason === "refusal") return { ok: false as const, reason: "refusal" as const };

  const out = r.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return { ok: true as const, text: out, attempts };
}
