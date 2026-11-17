import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { redirectApp } = await load(import.meta.url, "P28-E69.ts");

function setup(t, { broken = false } = {}) {
  const links = new Map([
    ["abc", { url: "https://example.com/a", expiresAt: null }],
    ["old", { url: "https://example.com/old", expiresAt: 1000 }],
    ["soon", { url: "https://example.com/soon", expiresAt: 5000 }],
  ]);
  const calls = { store: 0, sets: [] };
  const data = new Map();
  const store = { get: async (code) => { calls.store++; return links.get(code) ?? null; } };
  const cache = {
    get: async (k) => { if (broken) throw new Error("ECONNREFUSED"); return data.get(k) ?? null; },
    set: async (k, v, ttl) => { if (broken) throw new Error("ECONNREFUSED"); calls.sets.push([k, ttl]); data.set(k, v); },
  };
  let clock = 2000;
  return {
    calls, data,
    tick: (ms) => { clock += ms; },
    async start() {
      const { base, close } = await listen(redirectApp({ store, cache, now: () => clock }));
      t.after(close);
      return (path) => fetch(base + path, { redirect: "manual" });
    },
  };
}

test("MISS ואז HIT; המסד נקרא פעם אחת", async (t) => {
  const s = setup(t);
  const get = await s.start();
  let r = await get("/abc");
  assert.equal(r.status, 302);
  assert.equal(r.headers.get("location"), "https://example.com/a");
  assert.equal(r.headers.get("x-cache"), "MISS");
  r = await get("/abc");
  assert.equal(r.status, 302);
  assert.equal(r.headers.get("x-cache"), "HIT");
  assert.equal(s.calls.store, 1);
  assert.deepEqual(s.calls.sets, [["link:abc", 3600]]);
  assert.deepEqual(JSON.parse(s.data.get("link:abc")), { url: "https://example.com/a", expiresAt: null });
});
test("404 לא נשמר; 410 גם מה־cache", async (t) => {
  const s = setup(t);
  const get = await s.start();
  let r = await get("/nope");
  assert.equal(r.status, 404);
  assert.equal(s.data.size, 0);
  r = await get("/old");
  assert.equal(r.status, 410);
  r = await get("/soon");
  assert.equal(r.status, 302);
  s.tick(3000);
  r = await get("/soon");
  assert.equal(r.status, 410, "פג אחרי שנשמר ב־cache");
  assert.equal(r.headers.get("x-cache"), "HIT");
});
test("cache למטה ← עדיין עובד", async (t) => {
  const s = setup(t, { broken: true });
  const get = await s.start();
  const r = await get("/abc");
  assert.equal(r.status, 302);
  assert.equal(r.headers.get("x-cache"), "MISS");
  assert.equal((await get("/nope")).status, 404);
});
