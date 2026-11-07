import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { idempotency } = await load(import.meta.url, "P24-E15.ts");

// מאגר פשוט לבדיקה (בלי תוקף) — רושם גם את מה שנקרא
function memoryStore() {
  const rows = new Map();
  const calls = [];
  return {
    calls,
    rows,
    begin(scope, key, fp) {
      calls.push(["begin", scope, key]);
      const id = `${scope}|${key}`;
      const r = rows.get(id);
      if (!r) { rows.set(id, { fp, response: null }); return { kind: "new" }; }
      if (r.fp !== fp) return { kind: "mismatch" };
      if (!r.response) return { kind: "in_progress" };
      return { kind: "replay", response: r.response };
    },
    complete(scope, key, response) { calls.push(["complete", scope, key, response.status]); rows.get(`${scope}|${key}`).response = response; },
    release(scope, key) { calls.push(["release", scope, key]); rows.delete(`${scope}|${key}`); },
  };
}

async function start(t) {
  const store = memoryStore();
  const app = express();
  app.use(express.json());
  app.use(idempotency({ store }));
  let n = 0;
  let gate = null;
  app.post("/orders", async (req, res) => {
    if (req.body.wait) await new Promise((r) => (gate = r));
    if (req.body.fail === "500") return res.status(500).json({ error: "db down" });
    if (req.body.fail === "throw") throw new Error("boom");
    if (req.body.fail === "422") return res.status(422).json({ error: "bad" });
    res.status(201).json({ id: ++n, item: req.body.item });
  });
  app.post("/other", (req, res) => res.status(201).json({ other: true }));
  app.get("/orders", (req, res) => res.json({ n }));
  app.use((err, req, res, next) => res.status(500).json({ error: "internal" }));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  const post = (path, body, key, user = "u1") => call("POST", path, body, { headers: { ...(key ? { "Idempotency-Key": key } : {}), "x-user-id": user } });
  return { store, post, call, release: () => gate?.() };
}

test("replay: אותה תשובה, בלי לבצע שוב", async (t) => {
  const { post } = await start(t);
  const a = await post("/orders", { item: "ספר" }, "order-key-1");
  assert.equal(a.status, 201);
  assert.equal(a.headers.get("idempotent-replayed"), null);
  const b = await post("/orders", { item: "ספר" }, "order-key-1");
  assert.equal(b.status, 201);
  assert.deepEqual(b.body, { id: 1, item: "ספר" });
  assert.equal(b.headers.get("idempotent-replayed"), "true");
  assert.equal((await post("/orders", { item: "ספר" }, "order-key-2")).body.id, 2, "מפתח אחר — בקשה חדשה");
});
test("בלי מפתח, ו־GET — כרגיל", async (t) => {
  const { post, call, store } = await start(t);
  assert.equal((await post("/orders", { item: "x" })).body.id, 1);
  assert.equal((await post("/orders", { item: "x" })).body.id, 2);
  assert.equal((await call("GET", "/orders", undefined, { headers: { "Idempotency-Key": "get-key-0001" } })).status, 200);
  assert.equal(store.calls.length, 0, "המאגר לא נקרא בכלל");
});
test("mismatch: גוף אחר או נתיב אחר ← 422", async (t) => {
  const { post } = await start(t);
  await post("/orders", { item: "ספר" }, "order-key-1");
  assert.equal((await post("/orders", { item: "עט" }, "order-key-1")).status, 422);
  assert.equal((await post("/other", { item: "ספר" }, "order-key-1")).status, 422);
});
test("scope: לפי משתמש", async (t) => {
  const { post } = await start(t);
  await post("/orders", { item: "ספר" }, "order-key-1", "u1");
  const other = await post("/orders", { item: "ספר" }, "order-key-1", "u2");
  assert.equal(other.body.id, 2);
  assert.equal(other.headers.get("idempotent-replayed"), null);
});
test("מפתח לא תקין ← 400", async (t) => {
  const { post } = await start(t);
  for (const k of ["short", "x".repeat(101), "has space-1234"]) assert.equal((await post("/orders", { item: "x" }, k)).status, 400, k);
});
test("עדיין בטיפול ← 409", async (t) => {
  const { post, release } = await start(t);
  const first = post("/orders", { item: "x", wait: true }, "slow-key-01");
  await new Promise((r) => setTimeout(r, 50));
  assert.equal((await post("/orders", { item: "x", wait: true }, "slow-key-01")).status, 409);
  release();
  assert.equal((await first).status, 201);
});
test("4xx נשמר; 5xx וחריגה — משתחררים", async (t) => {
  const { post, store } = await start(t);
  assert.equal((await post("/orders", { fail: "422" }, "key-422-01")).status, 422);
  const again = await post("/orders", { fail: "422" }, "key-422-01");
  assert.equal(again.headers.get("idempotent-replayed"), "true", "422 היא תשובה סופית — נשמרת");
  assert.equal((await post("/orders", { fail: "500" }, "key-500-01")).status, 500);
  assert.equal((await post("/orders", { fail: "500" }, "key-500-01")).headers.get("idempotent-replayed"), null, "500 לא נשמר — ניסיון חוזר מבצע שוב");
  assert.equal((await post("/orders", { fail: "throw" }, "key-throw-1")).status, 500);
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(store.calls.some((c) => c[0] === "release" && c[2] === "key-throw-1"), "חריגה ב־handler ← release");
  assert.ok(!store.rows.has("u1|key-throw-1"));
});
