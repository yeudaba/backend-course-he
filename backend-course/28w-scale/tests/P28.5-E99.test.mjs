import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { revenueApi } = await load(import.meta.url, "P28.5-E99.ts");

async function start(t) {
  let clock = 1_000_000;
  let asOf = "2026-10-01T10:45:00Z";
  const calls = [];
  const app = revenueApi({
    query: async (p) => { calls.push(p); return [{ category: "beans", revenue: 100 }]; },
    asOf: () => asOf,
    now: () => clock,
    ttlMs: 60_000,
  });
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), calls, tick: (ms) => { clock += ms; }, setAsOf: (s) => { asOf = s; } };
}

test("MISS, HIT לפי מפתח מנורמל, asOf מקורי", async (t) => {
  const s = await start(t);
  let r = await s.call("GET", "/revenue?from=2026-10-01&to=2026-10-07&country=il");
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-cache"), "MISS");
  assert.deepEqual(r.body, { rows: [{ category: "beans", revenue: 100 }], asOf: "2026-10-01T10:45:00Z" });
  assert.deepEqual(s.calls, [{ from: "2026-10-01", to: "2026-10-07", country: "IL" }]);
  s.setAsOf("2026-10-01T11:00:00Z");
  r = await s.call("GET", "/revenue?country=IL&to=2026-10-07&from=2026-10-01");
  assert.equal(r.headers.get("x-cache"), "HIT");
  assert.equal(r.body.asOf, "2026-10-01T10:45:00Z");
  assert.equal(s.calls.length, 1);
  s.tick(60_000);
  r = await s.call("GET", "/revenue?from=2026-10-01&to=2026-10-07&country=IL");
  assert.equal(r.headers.get("x-cache"), "MISS");
  assert.equal(r.body.asOf, "2026-10-01T11:00:00Z");
  r = await s.call("GET", "/revenue?from=2026-10-01&to=2026-10-07");
  assert.equal(r.headers.get("x-cache"), "MISS");
  assert.deepEqual(s.calls.at(-1), { from: "2026-10-01", to: "2026-10-07", country: null });
});
test("400", async (t) => {
  const s = await start(t);
  for (const q of ["from=2026-10-07&to=2026-10-01", "from=2026-01-01&to=2026-06-01", "from=2026/10/01&to=2026-10-02", "to=2026-10-02", "from=2026-10-01&to=2026-10-02&country=ISR", "from=2026-10-01&to=2026-10-02&country=1L"]) {
    const r = await s.call("GET", `/revenue?${q}`);
    assert.equal(r.status, 400, q);
    assert.ok(r.body.error, q);
  }
  assert.equal((await s.call("GET", "/revenue?from=2026-10-01&to=2027-01-01")).status, 200, "92 יום — מותר");
  assert.equal(s.calls.length, 1);
});
