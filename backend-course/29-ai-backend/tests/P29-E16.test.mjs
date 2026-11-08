import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { createCachedAsk } = await load(import.meta.url, "P29-E16.ts");
function kv() {
  const m = new Map();
  return { m, get: async (k) => (m.has(k) ? m.get(k).v : null), set: async (k, v, ttl) => void m.set(k, { v, ttl }) };
}

test("אותה שאלה (גם עם רווחים ואותיות אחרות) ← קריאה אחת", async () => {
  const { client, bodies } = fakeClaude(() => message("א׳–ה׳ 9:00–17:00"));
  const store = kv();
  const c = createCachedAsk(client, store, { model: "claude-opus-5-5", system: "shop", ttlSeconds: 600 });
  assert.equal(await c.ask("What are   the hours?"), "א׳–ה׳ 9:00–17:00");
  assert.equal(await c.ask("  what are the HOURS? "), "א׳–ה׳ 9:00–17:00");
  assert.equal(bodies().length, 1);
  assert.deepEqual(c.stats, { hits: 1, misses: 1 });
  assert.equal([...store.m.values()][0].ttl, 600);
  assert.ok([...store.m.keys()][0].length < 100, "המפתח הוא hash — לא השאלה עצמה");
});
test("מודל או system אחרים ← מפתח אחר", async () => {
  const { client, bodies } = fakeClaude(() => message("x"));
  const store = kv();
  await createCachedAsk(client, store, { model: "claude-opus-5-5", system: "a" }).ask("q");
  await createCachedAsk(client, store, { model: "claude-opus-5-5", system: "b" }).ask("q");
  await createCachedAsk(client, store, { model: "claude-sonnet-5-5", system: "a" }).ask("q");
  assert.equal(bodies().length, 3);
});
test("תשובה חתוכה לא נשמרת", async () => {
  const { client, bodies } = fakeClaude(() => message("חצי", { stop_reason: "max_tokens" }));
  const c = createCachedAsk(client, kv(), { model: "claude-opus-5-5", system: "s" });
  await c.ask("q");
  await c.ask("q");
  assert.equal(bodies().length, 2);
});
