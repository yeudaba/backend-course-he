import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E102.ts", ["createFormSubmitter"])).createFormSubmitter;
function setup(outcomes) {
  const sent = [];
  let n = 0;
  const send = async (body, key) => {
    sent.push({ body, key });
    await sleep(10);
    const o = outcomes[sent.length - 1];
    if (o instanceof Error) throw o;
    return o;
  };
  return { sent, send, newKey: () => `key-${++n}` };
}

test("הצלחה ← המפתח נמחק; השליחה הבאה — מפתח חדש", async () => {
  const create = await get();
  const { sent, send, newKey } = setup(["ok1", "ok2"]);
  const f = create({ send, newKey });
  assert.equal(f.currentKey(), null);
  assert.equal(await f.submit({ t: 1 }), "ok1");
  assert.equal(f.currentKey(), null);
  assert.equal(await f.submit({ t: 2 }), "ok2");
  assert.deepEqual(sent.map((s) => s.key), ["key-1", "key-2"]);
});
test("כישלון ← המפתח נשאר, גם עם גוף מתוקן", async () => {
  const create = await get();
  const { sent, send, newKey } = setup([new Error("network"), new Error("422"), "ok"]);
  const f = create({ send, newKey });
  await assert.rejects(f.submit({ t: 1 }), { message: "network" });
  assert.equal(f.currentKey(), "key-1");
  await assert.rejects(f.submit({ t: 1 }), { message: "422" });
  assert.equal(await f.submit({ t: 2 }), "ok");
  assert.deepEqual(sent.map((s) => s.key), ["key-1", "key-1", "key-1"]);
  assert.deepEqual(sent[2].body, { t: 2 });
  assert.equal(f.currentKey(), null);
});
test("לחיצה כפולה ← אותה Promise, שליחה אחת", async () => {
  const create = await get();
  const { sent, send, newKey } = setup(["ok", "ok2"]);
  const f = create({ send, newKey });
  const a = f.submit({ t: 1 });
  const b = f.submit({ t: 1 });
  assert.equal(a, b);
  await a;
  assert.equal(sent.length, 1);
  assert.equal(await f.submit({ t: 1 }), "ok2", "אחרי שהסתיים — אפשר לשלוח שוב");
});
test("לחיצה כפולה בזמן כישלון", async () => {
  const create = await get();
  const { sent, send, newKey } = setup([new Error("x"), "ok"]);
  const f = create({ send, newKey });
  const a = f.submit({});
  const b = f.submit({});
  await assert.rejects(a);
  await assert.rejects(b);
  assert.equal(sent.length, 1);
  assert.equal(await f.submit({}), "ok");
});
