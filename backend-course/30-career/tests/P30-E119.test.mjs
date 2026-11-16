import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { trackerApp } = await load(import.meta.url, "P30-E119.ts");

async function start(t) {
  let ms = Date.UTC(2026, 10, 3, 9, 0);
  const { base, close } = await listen(trackerApp(() => new Date(ms)));
  t.after(close);
  return { call: api(base), tick: (m) => (ms += m * 60_000) };
}

test("יצירה ומעברים", async (t) => {
  const { call, tick } = await start(t);
  let r = await call("POST", "/applications", { company: "  Acme ", role: "Junior Backend", channel: "referral" });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, company: "Acme", role: "Junior Backend", channel: "referral", stage: "applied", history: [{ stage: "applied", at: "2026-11-03T09:00:00.000Z" }] });
  await call("POST", "/applications", { company: "Brew", role: "Backend", channel: "linkedin" });
  tick(60);
  r = await call("PATCH", "/applications/1/stage", { stage: "screen" });
  assert.equal(r.status, 200);
  assert.equal(r.body.stage, "screen");
  assert.deepEqual(r.body.history.at(-1), { stage: "screen", at: "2026-11-03T10:00:00.000Z" });
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "interview" })).status, 200);
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "offer" })).status, 200);
  assert.equal((await call("PATCH", "/applications/2/stage", { stage: "rejected" })).status, 200);
  assert.deepEqual((await call("GET", "/stats")).body, { total: 2, byStage: { applied: 0, screen: 0, interview: 0, offer: 1, rejected: 1 } });
});
test("שגיאות: 400, 404, 409", async (t) => {
  const { call } = await start(t);
  for (const body of [{}, { company: "", role: "x", channel: "referral" }, { company: "a", role: "x".repeat(101), channel: "referral" }, { company: "a", role: "b", channel: "twitter" }]) {
    assert.equal((await call("POST", "/applications", body)).status, 400, JSON.stringify(body).slice(0, 50));
  }
  await call("POST", "/applications", { company: "A", role: "B", channel: "community" });
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "offer" })).status, 409, "applied ← offer");
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "applied" })).status, 409);
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "hired" })).status, 400);
  assert.equal((await call("PATCH", "/applications/99/stage", { stage: "screen" })).status, 404);
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "rejected" })).status, 200);
  assert.equal((await call("PATCH", "/applications/1/stage", { stage: "screen" })).status, 409, "rejected — סופי");
  const s = (await call("GET", "/stats")).body;
  assert.deepEqual(s, { total: 1, byStage: { applied: 0, screen: 0, interview: 0, offer: 0, rejected: 1 } });
});
