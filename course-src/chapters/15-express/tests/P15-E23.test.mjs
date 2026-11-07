import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E23.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("הזמנות", async (t) => {
  const call = await start(t, createApp());
  assert.deepEqual((await call("GET", "/orders/1")).body, { id: 1, itemIds: [10, 11, 10] });
  assert.deepEqual((await call("GET", "/orders/1/total")).body, { total: 85 });
  for (const p of ["/orders/99", "/orders/99/total"]) {
    const res = await call("GET", p);
    assert.equal(res.status, 404, p);
    assert.equal(res.body.error.code, "NOT_FOUND");
  }
});
