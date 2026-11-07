import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E22.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("pagination עם ולידציה", async (t) => {
  const call = await start(t, createApp());
  const orig = console.error;
  console.error = () => {};
  try {
    let res = await call("GET", "/products?page=2&limit=5");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.meta, { page: 2, limit: 5, total: 23 });
    assert.deepEqual(res.body.data.map((p) => p.id), [6, 7, 8, 9, 10]);
    res = await call("GET", "/products");
    assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 23 });
    res = await call("GET", "/products?page=0");
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  } finally {
    console.error = orig;
  }
});
