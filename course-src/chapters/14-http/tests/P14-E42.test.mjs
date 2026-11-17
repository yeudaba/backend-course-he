import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E42.mjs", ["routeKey"])).routeKey;

test("מספרים ← :id", async () => {
  const f = await get();
  assert.equal(f("get", "/products/17?sort=price"), "GET /products/:id");
  assert.equal(f("post", "//orders/5/items/"), "POST /orders/:id/items");
  assert.equal(f("PATCH", "http://localhost:3000/orders/12/items/3"), "PATCH /orders/:id/items/:id");
  assert.equal(f("GET", "/v2/products/7a"), "GET /v2/products/7a", "v2 ו־7a הם לא 'רק ספרות'");
});
test("UUID ← :uuid", async () => {
  const f = await get();
  assert.equal(f("DELETE", "https://api.test/users/3f2c9a1e-0b7d-4c1a-9f00-2a6b8c4d5e6f/"), "DELETE /users/:uuid");
  assert.equal(f("get", "/users/3F2C9A1E-0B7D-4C1A-9F00-2A6B8C4D5E6F/posts"), "GET /users/:uuid/posts", "גם באותיות גדולות");
  assert.equal(f("get", "/users/3f2c9a1e-0b7d-4c1a-9f00-2a6b8c4d5e6"), "GET /users/3f2c9a1e-0b7d-4c1a-9f00-2a6b8c4d5e6", "חסר תו — לא UUID");
  assert.equal(f("get", "/x/3f2c9a1e0b7d4c1a9f002a6b8c4d5e6f"), "GET /x/3f2c9a1e0b7d4c1a9f002a6b8c4d5e6f", "בלי מקפים — לא UUID");
});
test("שורש", async () => {
  const f = await get();
  assert.equal(f("GET", "/"), "GET /");
  assert.equal(f("get", "https://api.test?x=1"), "GET /");
});
