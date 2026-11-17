import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E99.ts", ["runOnce"])).runOnce;

test("פעם ראשונה, replay, טביעה אחרת, ומשתמש אחר", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  let n = 0;
  const fn = async () => ({ orderId: `o${++n}` });
  assert.deepEqual(await f(db, "u1", "k1", "fp", fn), { replayed: false, result: { orderId: "o1" } });
  assert.deepEqual(await f(db, "u1", "k1", "fp", fn), { replayed: true, result: { orderId: "o1" } });
  await assert.rejects(f(db, "u1", "k1", "other", fn), { message: "KEY_REUSED" });
  assert.deepEqual(await f(db, "u2", "k1", "fp", fn), { replayed: false, result: { orderId: "o2" } });
  assert.equal(n, 2);
});
test("כישלון משחרר; 10 במקביל ← פעם אחת", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await assert.rejects(f(db, "u1", "k2", "fp", async () => { throw new Error("payment failed"); }), { message: "payment failed" });
  assert.equal(await db.collection("idempotency").countDocuments(), 0);
  let calls = 0;
  const slow = async () => { calls++; await sleep(50); return 42; };
  const r = await Promise.allSettled(Array.from({ length: 10 }, () => f(db, "u1", "k3", "fp", slow)));
  assert.equal(calls, 1);
  assert.equal(r.filter((x) => x.status === "fulfilled").length, 1);
  assert.ok(r.filter((x) => x.status === "rejected").every((x) => x.reason.message === "IN_PROGRESS"));
  assert.deepEqual(await f(db, "u1", "k3", "fp", slow), { replayed: true, result: 42 });
});
