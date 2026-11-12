import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E67.ts", ["sendWithRetry"])).sendWithRetry;

// send מדומה: כל צעד — מספר (status) או "throw"
function fake(steps) {
  const calls = [];
  const send = async (body, key) => {
    calls.push({ body, key });
    const s = steps[calls.length - 1];
    if (s === "throw") throw new Error(`network ${calls.length}`);
    return { status: s, body: { n: calls.length } };
  };
  return { send, calls };
}
function opts(retries) {
  const sleeps = [];
  let k = 0;
  return { sleeps, o: { retries, sleep: async (ms) => { sleeps.push(ms); }, newKey: () => `key-${++k}` } };
}

test("הצלחה מיד", async () => {
  const sendWithRetry = await get();
  const { send, calls } = fake([201]);
  const { o, sleeps } = opts(3);
  assert.deepEqual(await sendWithRetry(send, { a: 1 }, o), { status: 201, body: { n: 1 }, attempts: 1, key: "key-1" });
  assert.deepEqual(calls, [{ body: { a: 1 }, key: "key-1" }]);
  assert.deepEqual(sleeps, []);
});
test("רשת, 503, 409 ואז 201 — אותו מפתח, backoff", async () => {
  const sendWithRetry = await get();
  const { send, calls } = fake(["throw", 503, 409, 201]);
  const { o, sleeps } = opts(5);
  const r = await sendWithRetry(send, "b", o);
  assert.deepEqual(r, { status: 201, body: { n: 4 }, attempts: 4, key: "key-1" });
  assert.deepEqual(calls.map((c) => c.key), ["key-1", "key-1", "key-1", "key-1"], "מפתח אחד לכל הניסיונות");
  assert.deepEqual(sleeps, [200, 400, 800]);
});
test("4xx אחרים — בלי ניסיון נוסף", async () => {
  const sendWithRetry = await get();
  for (const status of [400, 401, 404, 422, 429]) {
    const { send, calls } = fake([status, 201]);
    const r = await sendWithRetry(send, {}, opts(3).o);
    assert.equal(r.status, status);
    assert.equal(calls.length, 1, `על ${status} לא מנסים שוב`);
  }
});
test("נגמרו הניסיונות", async () => {
  const sendWithRetry = await get();
  const a = fake([503, 503, 502]);
  const r = await sendWithRetry(a.send, {}, opts(2).o);
  assert.deepEqual(r, { status: 502, body: { n: 3 }, attempts: 3, key: "key-1" });
  const b = fake([503, "throw", "throw"]);
  await assert.rejects(sendWithRetry(b.send, {}, opts(2).o), { message: "network 3" }, "השגיאה של הניסיון האחרון");
  const c = fake(["throw", "throw", 500]);
  assert.equal((await sendWithRetry(c.send, {}, opts(2).o)).status, 500, "האחרון היה תשובה ← מחזירים אותה");
  const d = fake(["throw"]);
  await assert.rejects(sendWithRetry(d.send, {}, opts(0).o), { message: "network 1" }, "retries: 0 ← ניסיון אחד");
  assert.equal(d.calls.length, 1);
});
test("newKey נקרא פעם אחת", async () => {
  const sendWithRetry = await get();
  let n = 0;
  const { send } = fake([503, 503, 200]);
  await sendWithRetry(send, {}, { retries: 3, sleep: async () => {}, newKey: () => `k${++n}` });
  assert.equal(n, 1);
});
