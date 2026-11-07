import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRouter } = await load(import.meta.url, "P14-E16.mjs");

test("router", () => {
  const r = createRouter();
  const [list, create, newForm, one, del, reviews] = ["list", "create", "new", "one", "del", "reviews"].map((n) => () => n);
  r.add("GET", "/products", list);
  r.add("POST", "/products", create);
  r.add("GET", "/products/new", newForm);
  r.add("GET", "/products/:id", one);
  r.add("DELETE", "/products/:id", del);
  r.add("GET", "/products/:id/reviews/:rid", reviews);

  assert.deepEqual(r.match("GET", "/products/"), { status: 200, handler: list, params: {} });
  assert.deepEqual(r.match("POST", "/products"), { status: 200, handler: create, params: {} });
  assert.equal(r.match("GET", "/products/new").handler, newForm);
  assert.deepEqual(r.match("GET", "/products/7"), { status: 200, handler: one, params: { id: "7" } });
  assert.deepEqual(r.match("DELETE", "/products/%D7%90"), { status: 200, handler: del, params: { id: "א" } });
  assert.deepEqual(r.match("GET", "//products/7/reviews/3"), { status: 200, handler: reviews, params: { id: "7", rid: "3" } });
  assert.deepEqual(r.match("PUT", "/products/7"), { status: 405, allow: ["GET", "DELETE"] });
  assert.deepEqual(r.match("GET", "/products/7/x"), { status: 404 });
  assert.deepEqual(r.match("GET", "/"), { status: 404 });
});
