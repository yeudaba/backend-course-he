import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { agentApp } = await load(import.meta.url, "P29.5-E42.ts");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function start(t, run, timeoutMs = 1000) {
  const { base, close } = await listen(agentApp(run, { timeoutMs }));
  t.after(close);
  return { base, call: api(base) };
}

test("done, max_steps, 400", async (t) => {
  const prompts = [];
  let s = await start(t, async (p) => (prompts.push(p), { status: "done", text: "הזמנה 3 נשלחה" }));
  assert.deepEqual(await s.call("POST", "/agent", { prompt: "  מה עם הזמנה 3? " }).then((r) => [r.status, r.body]), [200, { status: "done", text: "הזמנה 3 נשלחה" }]);
  assert.deepEqual(prompts, ["מה עם הזמנה 3?"]);
  for (const body of [{}, { prompt: "  " }, { prompt: 7 }, { prompt: "x".repeat(4001) }]) assert.equal((await s.call("POST", "/agent", body)).status, 400);
  assert.equal(prompts.length, 1, "בלי הרצה על קלט לא תקין");
  s = await start(t, async () => ({ status: "max_steps" }));
  assert.deepEqual((await s.call("POST", "/agent", { prompt: "x" })).body, { status: "handed_off", text: "לא הצלחתי להשלים — העברתי לנציג" });
});
test("timeout ← 504 מיד, וה־signal מבוטל", async (t) => {
  let signal;
  const s = await start(t, (p, sig) => { signal = sig; return new Promise((resolve) => sig.addEventListener("abort", () => setTimeout(() => resolve({ status: "done", text: "late" }), 150))); }, 100);
  const t0 = Date.now();
  const r = await s.call("POST", "/agent", { prompt: "x" });
  const ms = Date.now() - t0;
  assert.equal(r.status, 504);
  assert.deepEqual(r.body, { error: "timeout" });
  assert.ok(ms < 230, `לא מחכים ל־run (${ms}ms)`);
  assert.equal(signal.aborted, true);
  await wait(200); // run מסיים אחרי ה־504 — אסור שיפיל את השרת
  assert.equal((await s.call("POST", "/agent", { prompt: "" })).status, 400, "השרת עדיין חי");
});
test("run זרק ← 500 בלי פרטים; ה־timer מבוטל", async (t) => {
  const s = await start(t, async () => { throw new Error("org-42 secret"); }, 60_000);
  const r = await s.call("POST", "/agent", { prompt: "x" });
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { error: "agent_failed" });
  const ok = await start(t, async () => ({ status: "done", text: "a" }), 60_000);
  const before = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  await ok.call("POST", "/agent", { prompt: "x" });
  await wait(20);
  const after = process.getActiveResourcesInfo().filter((x) => x === "Timeout").length;
  assert.ok(after <= before, "timer של דקה נשאר פתוח אחרי שה־run סיים");
});
test("הלקוח התנתק ← signal מבוטל", async (t) => {
  let signal;
  const s = await start(t, (p, sig) => { signal = sig; return new Promise((resolve) => sig.addEventListener("abort", () => resolve({ status: "max_steps" }))); }, 5000);
  const ac = new AbortController();
  const pending = fetch(`${s.base}/agent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: "x" }), signal: ac.signal }).catch(() => {});
  for (let i = 0; i < 50 && !signal; i++) await wait(10);
  assert.equal(signal.aborted, false);
  ac.abort();
  await pending;
  for (let i = 0; i < 50 && !signal.aborted; i++) await wait(10);
  assert.equal(signal.aborted, true);
});
