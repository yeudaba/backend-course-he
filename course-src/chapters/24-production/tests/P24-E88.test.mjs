import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E88.ts", ["fetchPolitely"])).fetchPolitely;

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const [status, headers = {}] = responses[Math.min(calls.length - 1, responses.length - 1)];
    return new Response(`r${calls.length}`, { status, headers });
  };
  return { fn, calls };
}
const politely = async (responses, opts = {}) => {
  const fetchPolitely = await get();
  const { fn, calls } = fakeFetch(responses);
  const sleeps = [];
  const res = await fetchPolitely(fn, "http://api/x", { method: "POST", body: "b" }, { sleep: async (ms) => { sleeps.push(ms); }, ...opts });
  return { res, calls, sleeps, text: await res.text() };
};

test("429 עם Retry-After ← מחכים בשניות ושולחים שוב", async () => {
  const { res, calls, sleeps, text } = await politely([[429, { "Retry-After": "3" }], [201]]);
  assert.equal(res.status, 201);
  assert.equal(text, "r2");
  assert.deepEqual(sleeps, [3000]);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { url: "http://api/x", init: { method: "POST", body: "b" } }, "אותה בקשה");
});
test("503 גם; maxRetries", async () => {
  const a = await politely([[503, { "Retry-After": "1" }], [503, { "Retry-After": "2" }], [503, { "Retry-After": "1" }], [200]]);
  assert.equal(a.res.status, 503, "ברירת מחדל: 2 ניסיונות נוספים");
  assert.deepEqual(a.sleeps, [1000, 2000]);
  assert.equal(a.calls.length, 3);
  const b = await politely([[429, { "Retry-After": "1" }], [200]], { maxRetries: 0 });
  assert.equal(b.res.status, 429);
  assert.equal(b.calls.length, 1);
});
test("לא מחכים", async () => {
  for (const headers of [{}, { "Retry-After": "1.5" }, { "Retry-After": "-1" }, { "Retry-After": "Wed, 21 Oct 2026 07:28:00 GMT" }, { "Retry-After": "61" }]) {
    const { res, calls, sleeps } = await politely([[429, headers], [200]]);
    assert.equal(res.status, 429, JSON.stringify(headers));
    assert.equal(calls.length, 1);
    assert.deepEqual(sleeps, []);
  }
  const big = await politely([[429, { "Retry-After": "120" }], [200]], { maxWaitSeconds: 120 });
  assert.equal(big.res.status, 200, "maxWaitSeconds משלך");
  assert.deepEqual(big.sleeps, [120000]);
});
test("תשובות אחרות — מיד", async () => {
  for (const s of [200, 400, 404, 500, 502]) {
    const { res, calls } = await politely([[s, { "Retry-After": "1" }], [200]]);
    assert.equal(res.status, s);
    assert.equal(calls.length, 1);
  }
});
