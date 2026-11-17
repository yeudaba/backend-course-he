import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";
import { fakeClaude, message, thinking } from "./_claude.mjs";

const { askApp } = await load(import.meta.url, "P29-E39.ts");

async function start(t, respond) {
  const f = fakeClaude(respond);
  const { base, close } = await listen(askApp(f.client));
  t.after(close);
  return { call: api(base), bodies: f.bodies };
}

test("200 עם תשובה", async (t) => {
  const s = await start(t, () => message([thinking(), " שעות המשלוח: 9–17 "]));
  const r = await s.call("POST", "/ask", { question: "  מתי משלוחים?  " });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { answer: "שעות המשלוח: 9–17" });
  const b = s.bodies()[0];
  assert.equal(b.model, "claude-opus-5-5");
  assert.ok(b.max_tokens >= 1024);
  assert.ok(b.system);
  assert.deepEqual(b.messages, [{ role: "user", content: "מתי משלוחים?" }]);
});
test("400 בלי קריאה", async (t) => {
  const s = await start(t, () => message("x"));
  for (const body of [{}, { question: "   " }, { question: 5 }, { question: "x".repeat(2001) }]) {
    assert.equal((await s.call("POST", "/ask", body)).status, 400, JSON.stringify(body).slice(0, 40));
  }
  assert.equal(s.bodies().length, 0);
});
test("refusal, max_tokens, שגיאת API", async (t) => {
  let s = await start(t, () => message("", { stop_reason: "refusal" }));
  assert.deepEqual((await s.call("POST", "/ask", { question: "?" })).body, { answer: null, reason: "refusal" });
  s = await start(t, () => message("חצי", { stop_reason: "max_tokens" }));
  let r = await s.call("POST", "/ask", { question: "?" });
  assert.equal(r.status, 502);
  assert.deepEqual(r.body, { error: "truncated" });
  s = await start(t, () => ({ error: 529, message: "org-123 overloaded internal" }));
  r = await s.call("POST", "/ask", { question: "?" });
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { error: "ai_unavailable" });
});
