import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { inFlight, parallelMessage } from "./_par.mjs";

const { loadDashboard } = await load(import.meta.url, "P10-E17.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("הצלחות וכשלונות", async () => {
  const r = await loadDashboard({ user: async () => ({ name: "דנה" }), weather: async () => { throw new Error("down"); }, cart: () => sleep(10, 3) });
  assert.deepEqual(r, { data: { user: { name: "דנה" }, cart: 3 }, errors: { weather: "down" } });
});
test("במקביל", async () => {
  const source = inFlight(() => sleep(30));
  await loadDashboard({ a: source.fn, b: source.fn, c: source.fn });
  assert.equal(source.max, 3, parallelMessage(source.max, 3, "Promise.allSettled"));
});
test("שגיאה שהיא לא Error (throw של מחרוזת) — ההודעה היא המחרוזת עצמה", async () => {
  const r = await loadDashboard({ a: async () => { throw "down"; }, b: async () => 1 });
  assert.deepEqual(r, { data: { b: 1 }, errors: { a: "down" } }, "ל־reason שהוא מחרוזת אין .message — השתמש ב־String(reason)");
});
test("ריק", async () => assert.deepEqual(await loadDashboard({}), { data: {}, errors: {} }));
