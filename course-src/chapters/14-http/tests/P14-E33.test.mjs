import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E33.mjs", ["methodInfo"])).methodInfo;

test("חמשת ה־methods", async () => {
  const f = await get();
  const expected = {
    GET: { hasBody: false, idempotent: true },
    POST: { hasBody: true, idempotent: false },
    PUT: { hasBody: true, idempotent: true },
    PATCH: { hasBody: true, idempotent: false },
    DELETE: { hasBody: false, idempotent: true },
  };
  for (const [m, want] of Object.entries(expected)) assert.deepEqual(f(m), want, `methodInfo("${m}")`);
});
test("אותיות ורווחים לא משנים", async () => {
  const f = await get();
  assert.deepEqual(f("get"), { hasBody: false, idempotent: true }, `methodInfo("get")`);
  assert.deepEqual(f(" Patch "), { hasBody: true, idempotent: false }, `methodInfo(" Patch ")`);
  assert.deepEqual(f("delete"), { hasBody: false, idempotent: true }, `methodInfo("delete")`);
});
test("method לא מוכר", async () => {
  const f = await get();
  for (const m of ["FETCH", "", "OPTIONS"]) {
    assert.throws(() => f(m), { message: `method לא מוכר: ${m}` }, `methodInfo("${m}") צריך לזרוק`);
  }
});
