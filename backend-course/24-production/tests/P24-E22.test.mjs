import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { idempotency } = await load(import.meta.url, "P24-E22.ts");
async function start(t) {
  const app = express();
  app.use(express.json());
  app.use(idempotency());
  let n = 0;
  let failNext = 0;
  app.post("/orders", (req, res) => {
    if (failNext > 0) { failNext--; return res.status(503).json({ error: "db down" }); }
    res.status(201).json({ id: ++n, owner: req.get("x-user-id"), item: req.body.item });
  });
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  return {
    post: (body, key, user) => call("POST", "/orders", body, { headers: { "Idempotency-Key": key, "x-user-id": user } }),
    fail: (k) => (failNext = k),
  };
}

test("עדיין עובד: replay", async (t) => {
  const { post } = await start(t);
  const a = await post({ item: "ספר" }, "key-0001", "dana");
  const b = await post({ item: "ספר" }, "key-0001", "dana");
  assert.deepEqual(b.body, a.body);
  assert.equal(b.headers.get("idempotent-replayed"), "true");
});
test("מפתח של משתמש אחר", async (t) => {
  const { post } = await start(t);
  await post({ item: "ספר" }, "key-0001", "dana");
  const y = await post({ item: "ספר" }, "key-0001", "yossi");
  assert.equal(y.body.owner, "yossi", "יוסי לא מקבל את ההזמנה של דנה");
  assert.equal(y.headers.get("idempotent-replayed"), null);
});
test("גוף אחר ← 422", async (t) => {
  const { post } = await start(t);
  await post({ item: "ספר" }, "key-0001", "dana");
  assert.equal((await post({ item: "מחשב" }, "key-0001", "dana")).status, 422);
});
test("5xx לא נשמר", async (t) => {
  const { post, fail } = await start(t);
  fail(1);
  assert.equal((await post({ item: "ספר" }, "key-0001", "dana")).status, 503);
  const retry = await post({ item: "ספר" }, "key-0001", "dana");
  assert.equal(retry.status, 201, "הניסיון החוזר באמת ניסה שוב");
});
