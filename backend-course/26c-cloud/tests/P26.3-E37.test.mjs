import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { handler } = await load(import.meta.url, "P26.3-E37.ts");
const call = async (e) => {
  const r = await handler({ body: null, ...e });
  assert.deepEqual(r.headers, { "Content-Type": "application/json" });
  assert.equal(typeof r.body, "string", "body חייב להיות מחרוזת");
  return { status: r.statusCode, body: JSON.parse(r.body) };
};

test("health ו־404", async () => {
  assert.deepEqual(await call({ httpMethod: "GET", path: "/health" }), { status: 200, body: { ok: true } });
  assert.deepEqual(await call({ httpMethod: "POST", path: "/health" }), { status: 404, body: { error: "not found" } });
  assert.deepEqual(await call({ httpMethod: "GET", path: "/orders" }), { status: 404, body: { error: "not found" } });
});
test("POST /orders — תקין, גם base64", async () => {
  assert.deepEqual(await call({ httpMethod: "POST", path: "/orders", body: '{"productId":7,"qty":2}' }), { status: 202, body: { accepted: true, productId: 7, qty: 2 } });
  const b64 = Buffer.from('{"productId":3,"qty":10}').toString("base64");
  assert.deepEqual(await call({ httpMethod: "POST", path: "/orders", body: b64, isBase64Encoded: true }), { status: 202, body: { accepted: true, productId: 3, qty: 10 } });
});
test("POST /orders — לא תקין", async () => {
  assert.deepEqual(await call({ httpMethod: "POST", path: "/orders", body: "{oops" }), { status: 400, body: { error: "JSON לא תקין" } });
  assert.deepEqual(await call({ httpMethod: "POST", path: "/orders", body: null }), { status: 400, body: { error: "JSON לא תקין" } });
  for (const body of ['{"productId":0,"qty":1}', '{"productId":7,"qty":11}', '{"productId":"7","qty":1}', '{"productId":7,"qty":1.5}', "null", "[]", '{"qty":1}']) {
    const r = await call({ httpMethod: "POST", path: "/orders", body });
    assert.equal(r.status, 400, body);
    assert.ok(r.body.error, body);
  }
});
