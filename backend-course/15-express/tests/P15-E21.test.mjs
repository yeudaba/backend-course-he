import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E21.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("מוצרים ו־X-Response-Time", async (t) => {
  const call = await start(t, createApp());
  const errors = [];
  const orig = console.error;
  console.error = (...a) => errors.push(a.join(" "));
  try {
    let res = await call("GET", "/products/1");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { id: 1, name: "מקלדת" });
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/);
    res = await call("GET", "/products/abc");
    assert.equal(res.status, 400);
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/);
    res = await call("GET", "/products/2");
    assert.equal(res.status, 404);
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/);
    await new Promise((r) => setTimeout(r, 20));
  } finally {
    console.error = orig;
  }
  assert.deepEqual(errors, [], "לא אמורות להיות שגיאות ביומן");
});
