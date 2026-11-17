import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E74.ts", ["createSingleFlight"])).createSingleFlight;

test("במקביל ← ריצה אחת ואותה Promise", async () => {
  const sf = (await get())();
  let calls = 0;
  const fn = async () => { calls++; await sleep(30); return { id: calls }; };
  const ps = [sf.run("k", fn), sf.run("k", fn), sf.run("k", fn)];
  assert.equal(ps[0], ps[1], "אותה Promise בדיוק");
  const results = await Promise.all(ps);
  assert.equal(calls, 1);
  assert.deepEqual(results, [{ id: 1 }, { id: 1 }, { id: 1 }]);
});
test("אחרי הצלחה — replay בלי לקרוא שוב; מפתח אחר — ריצה משלו", async () => {
  const sf = (await get())();
  let calls = 0;
  const fn = async () => ++calls;
  assert.equal(await sf.run("a", fn), 1);
  assert.equal(await sf.run("a", fn), 1);
  assert.equal(await sf.run("b", fn), 2);
  assert.equal(calls, 2);
  sf.forget("a");
  assert.equal(await sf.run("a", fn), 3, "אחרי forget — ריצה חדשה");
});
test("כישלון — כולם מקבלים את השגיאה, ושום דבר לא נשמר", async () => {
  const sf = (await get())();
  let calls = 0;
  const failing = async () => { calls++; await sleep(10); throw new Error("db down"); };
  const results = await Promise.allSettled([sf.run("k", failing), sf.run("k", failing)]);
  assert.deepEqual(results.map((r) => r.status), ["rejected", "rejected"]);
  assert.equal(results[0].reason.message, "db down");
  assert.equal(calls, 1);
  assert.equal(await sf.run("k", async () => "ok"), "ok", "הניסיון הבא רץ באמת");
});
test("מופעים נפרדים לא חולקים מצב", async () => {
  const create = await get();
  const a = create();
  const b = create();
  await a.run("k", async () => "a");
  assert.equal(await b.run("k", async () => "b"), "b");
});
