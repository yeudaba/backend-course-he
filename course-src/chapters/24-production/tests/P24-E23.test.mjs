import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { rateLimit } = await load(import.meta.url, "P24-E23.ts");
async function start(t) {
  const clock = { t: 1_000_000 };
  const app = express();
  app.use(rateLimit({ limit: 2, windowMs: 60_000, now: () => clock.t }));
  app.post("/login", (req, res) => res.json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  return { clock, login: (headers = {}) => call("POST", "/login", {}, { headers }) };
}

test("X-Forwarded-For לא עוקף", async (t) => {
  const { login } = await start(t);
  await login(); await login();
  for (let i = 0; i < 3; i++) assert.equal((await login({ "X-Forwarded-For": `10.0.0.${i}` })).status, 429, "header מזויף — עדיין אותו לקוח");
});
test("נדחות לא נספרות", async (t) => {
  const { login, clock } = await start(t);
  await login();
  clock.t += 30_000;
  await login();
  for (let i = 0; i < 10; i++) { clock.t += 1000; assert.equal((await login()).status, 429); }
  clock.t = 1_000_000 + 60_001; // הראשונה יצאה מהחלון
  assert.equal((await login()).status, 200, "מקום התפנה — למרות 10 ניסיונות שנדחו");
});
test("Retry-After בשניות", async (t) => {
  const { login, clock } = await start(t);
  await login(); await login();
  clock.t += 15_500;
  const r = await login();
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "45", "44.5 שניות ← 45");
});
