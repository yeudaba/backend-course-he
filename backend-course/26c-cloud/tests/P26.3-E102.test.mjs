import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { handler } = await load(import.meta.url, "P26.3-E102.ts");
const ev = (o) => ({ httpMethod: "GET", path: "/products", queryStringParameters: null, body: null, isBase64Encoded: false, ...o });
async function call(o) {
  const r = await handler(ev(o));
  assert.equal(r.headers?.["Content-Type"], "application/json");
  assert.equal(typeof r.body, "string", "body חייב להיות מחרוזת JSON");
  return { status: r.statusCode, body: JSON.parse(r.body) };
}

test("GET בלי query ועם query", async () => {
  const all = await call({});
  assert.equal(all.status, 200);
  assert.deepEqual(all.body.map((p) => p.id), [1, 2, 3]);
  const beans = await call({ queryStringParameters: { category: "beans" } });
  assert.deepEqual(beans.body.map((p) => p.id), [1, 3]);
  assert.deepEqual((await call({ queryStringParameters: { other: "x" } })).body.length, 3);
});
test("POST: JSON רגיל וב־base64", async () => {
  const body = JSON.stringify({ name: "Mug", price: 35 });
  const plain = await call({ httpMethod: "POST", body });
  assert.equal(plain.status, 201);
  assert.deepEqual(plain.body, { id: 4, name: "Mug", price: 35 });
  const b64 = await call({ httpMethod: "POST", body: Buffer.from(body).toString("base64"), isBase64Encoded: true });
  assert.equal(b64.status, 201, "גוף ב־base64 — צריך לפענח לפני JSON.parse");
  assert.equal(b64.body.name, "Mug");
});
test("שגיאות", async () => {
  assert.equal((await call({ httpMethod: "POST", body: "{oops" })).status, 400);
  assert.equal((await call({ httpMethod: "POST", body: Buffer.from("{oops").toString("base64"), isBase64Encoded: true })).status, 400);
  assert.equal((await call({ httpMethod: "POST", body: JSON.stringify({ name: "x", price: 0 }) })).status, 400);
  assert.equal((await call({ httpMethod: "DELETE" })).status, 404);
  assert.equal((await call({ path: "/orders" })).status, 404);
});
