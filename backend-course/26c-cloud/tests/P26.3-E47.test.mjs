import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { withAwsRetry } = await load(import.meta.url, "P26.3-E47.ts");
const err = (name, status) => Object.assign(new Error(name), { name, $metadata: { httpStatusCode: status } });
function flaky(failures) {
  let calls = 0;
  const fn = async () => { const f = failures[calls++]; if (f) throw f; return `ok after ${calls}`; };
  return { fn, calls: () => calls };
}

test("מנסה שוב על throttling ו־5xx, עם full jitter", async () => {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  const f = flaky([err("ThrottlingException", 400), err("SlowDown", 503), err("InternalError", 500)]);
  assert.equal(await withAwsRetry(f.fn, { sleep, random: () => 0.5 }), "ok after 4");
  assert.deepEqual(waits, [50, 100, 200], "random 0.5 × 100 × 2^n");
  const w2 = [];
  const g = flaky([err("RequestLimitExceeded", 400)]);
  assert.equal(await withAwsRetry(g.fn, { sleep: async (ms) => { w2.push(ms); }, random: () => 0.999, baseMs: 1000 }), "ok after 2");
  assert.deepEqual(w2, [999]);
});
test("שגיאה אחרת — מיד; ניסיונות נגמרו — השגיאה האחרונה", async () => {
  const waits = [];
  const sleep = async (ms) => { waits.push(ms); };
  const denied = flaky([err("AccessDenied", 403)]);
  await assert.rejects(withAwsRetry(denied.fn, { sleep }), { name: "AccessDenied" });
  assert.equal(denied.calls(), 1);
  assert.deepEqual(waits, []);
  const always = flaky([err("ThrottlingException", 400), err("ThrottlingException", 400), err("SlowDown", 503)]);
  await assert.rejects(withAwsRetry(always.fn, { sleep, retries: 2, random: () => 0 }), { name: "SlowDown" });
  assert.equal(always.calls(), 3, "ניסיון ראשון ועוד 2");
});
test("ברירות מחדל: sleep אמיתי, 3 ניסיונות חוזרים", async () => {
  const f = flaky([err("SlowDown", 503), err("SlowDown", 503), err("SlowDown", 503), err("SlowDown", 503)]);
  const start = Date.now();
  await assert.rejects(withAwsRetry(f.fn, { baseMs: 5 }));
  assert.equal(f.calls(), 4);
  assert.ok(Date.now() - start < 2000);
});
