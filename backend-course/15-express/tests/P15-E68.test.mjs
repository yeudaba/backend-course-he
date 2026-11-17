import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E68.ts";
const products = () => Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: i % 2 ? `Mouse ${i + 1}` : `Keyboard ${i + 1}`, price: 100 + i }));
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("ברירות מחדל", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, products());
  const r = await call("GET", "/products");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.data.map((p) => p.id), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(r.body.meta, { page: 1, limit: 10, total: 12, totalPages: 2 });
  assert.deepEqual(r.body.links, { self: "/products?page=1&limit=10", next: "/products?page=2&limit=10", prev: null });
});
test("חיפוש ועמוד באמצע", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, products());
  let r = await call("GET", "/products?q=MOUSE&page=2&limit=2");
  assert.deepEqual(r.body.data.map((p) => p.id), [6, 8]);
  assert.deepEqual(r.body.meta, { page: 2, limit: 2, total: 6, totalPages: 3 });
  assert.deepEqual(r.body.links, { self: "/products?q=MOUSE&page=2&limit=2", next: "/products?q=MOUSE&page=3&limit=2", prev: "/products?q=MOUSE&page=1&limit=2" });
  r = await call("GET", "/products?q=mouse&page=3&limit=2");
  assert.equal(r.body.links.next, null);
  r = await call("GET", "/products?q=" + encodeURIComponent("a b&c"));
  assert.deepEqual(r.body.meta, { page: 1, limit: 10, total: 0, totalPages: 0 });
  assert.deepEqual(r.body.links, { self: "/products?q=a+b%26c&page=1&limit=10", next: null, prev: null }, "q מקודד בקישור");
  r = await call("GET", "/products?page=5");
  assert.deepEqual(r.body.data, []);
  assert.equal(r.body.links.prev, "/products?page=4&limit=10");
});
test("page ו־limit לא תקינים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE, products());
  for (const q of ["page=0", "page=-1", "page=abc", "page=1.5", "limit=0", "limit=51", "limit=", "page=2abc", "limit=%202"]) {
    const r = await call("GET", "/products?" + q);
    assert.deepEqual([r.status, r.body], [400, { error: { code: "VALIDATION_ERROR", message: "page או limit לא תקינים" } }], q);
  }
  assert.equal((await call("GET", "/products?limit=50")).status, 200);
});
