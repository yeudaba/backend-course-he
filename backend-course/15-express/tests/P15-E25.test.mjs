import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E25.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
const key = (k) => ({ headers: { "Idempotency-Key": k } });

test("idempotency", async (t) => {
  const call = await start(t, createApp());
  assert.equal((await call("POST", "/orders", { item: "קפה" })).body.error.code, "MISSING_IDEMPOTENCY_KEY");

  const first = await call("POST", "/orders", { item: "קפה" }, key("a1"));
  assert.equal(first.status, 201);
  assert.deepEqual(first.body, { id: 1, item: "קפה" });
  assert.equal(first.headers.get("idempotent-replayed"), null);

  const again = await call("POST", "/orders", { item: "קפה" }, key("a1"));
  assert.equal(again.status, 201);
  assert.deepEqual(again.body, { id: 1, item: "קפה" });
  assert.equal(again.headers.get("idempotent-replayed"), "true");
  assert.equal((await call("GET", "/orders")).body.length, 1, "לא נוצרה הזמנה שנייה");

  const reused = await call("POST", "/orders", { item: "תה" }, key("a1"));
  assert.equal(reused.status, 422);
  assert.equal(reused.body.error.code, "IDEMPOTENCY_KEY_REUSED");

  assert.deepEqual((await call("POST", "/orders", { item: "תה" }, key("b2"))).body, { id: 2, item: "תה" });
});
test("שתי בקשות באותו רגע", async (t) => {
  const call = await start(t, createApp());
  const [a, b] = await Promise.all([call("POST", "/orders", { item: "x" }, key("same")), call("POST", "/orders", { item: "x" }, key("same"))]);
  assert.deepEqual([a.status, b.status].sort(), [201, 409]);
  assert.equal((await call("GET", "/orders")).body.length, 1);
});
