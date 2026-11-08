// P29-E16
import { createHash } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";

export interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

// cache לתשובות (cache-aside, פרק 26) — לשאלות שחוזרות ("מה שעות המשלוח?").
// המפתח: hash של כל מה שמשפיע על התשובה — מודל, system, והשאלה המנורמלת. שומרים רק תשובה שלמה (end_turn)
export function createCachedAsk(client: Anthropic, kv: KV, { model, system, ttlSeconds = 3600 }: { model: string; system: string; ttlSeconds?: number }) {
  const stats = { hits: 0, misses: 0 };
  async function askCached(question: string): Promise<string> {
    const normalized = question.trim().replace(/\s+/g, " ").toLowerCase();
    const key = "ai:" + createHash("sha256").update(JSON.stringify([model, system, normalized])).digest("hex");
    const hit = await kv.get(key);
    if (hit !== null) {
      stats.hits++;
      return hit;
    }
    stats.misses++;
    const response = await client.messages.create({ model, max_tokens: 2048, system, messages: [{ role: "user", content: question.trim() }] });
    const text = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");
    if (response.stop_reason === "end_turn" && text) await kv.set(key, text, ttlSeconds);
    return text;
  }
  return { ask: askCached, stats };
}
