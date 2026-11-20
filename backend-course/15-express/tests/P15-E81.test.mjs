import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./_app.mjs";

const FILE = "P15-E81.ts";

test("GET /products/:id מוצא מוצר קיים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const r = await call("GET", "/products/2");
  assert.equal(r.status, 200, "GET /products/2 — req.params.id הוא מחרוזת; השוואה למספר נכשלת");
  assert.deepEqual(r.body, { id: 2, name: "קפוצ׳ינו", price: 14 });
  const missing = await call("GET", "/products/99");
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.body, { error: "המוצר לא נמצא" });
});
test("GET /products/cheap", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const r = await call("GET", "/products/cheap");
  assert.equal(r.status, 200, "/products/cheap נתפס כ־:id — route קבוע צריך להירשם לפני route עם פרמטר");
  assert.deepEqual(r.body.map((p) => p.id), [1, 3]);
});
test("POST /products", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const r = await call("POST", "/products", { name: "תה", price: 8 });
  assert.equal(r.status, 201, "POST החזיר " + r.status + " — האם הגוף נקרא? (express.json)");
  assert.deepEqual(r.body, { id: 4, name: "תה", price: 8 });
  assert.equal((await call("GET", "/products/4")).body.name, "תה");
  assert.deepEqual((await call("GET", "/products/cheap")).body.map((p) => p.id), [1, 3, 4]);
});
