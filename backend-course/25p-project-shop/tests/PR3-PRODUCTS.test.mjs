import { test } from "node:test";
import assert from "node:assert/strict";
import { shop } from "./_shop.mjs";

// פרויקט 3, שלב 1: מוצרים — CRUD למנהל, חיפוש, סינון ו־pagination לכולם
test("CRUD והרשאות", async (t) => {
  const { call, adminCall, customer, product } = await shop(t);
  const p = await product({ name: "  מטחנה ידנית ", priceCents: 24900, stock: 5 });
  assert.equal(p.name, "מטחנה ידנית");
  assert.equal(p.priceCents, 24900);
  assert.equal(p.stock, 5);
  assert.equal(typeof p.id, "number");

  const dana = await customer();
  const data = { name: "x", priceCents: 100, stock: 1, category: "x" };
  assert.equal((await call("POST", "/products", data)).status, 401, "בלי התחברות ← 401");
  assert.equal((await dana("POST", "/products", data)).status, 403, "לקוח ← 403");
  assert.equal((await dana("PATCH", `/products/${p.id}`, { priceCents: 1 })).status, 403);
  assert.equal((await dana("DELETE", `/products/${p.id}`)).status, 403);

  for (const bad of [{ ...data, priceCents: 9.99 }, { ...data, priceCents: 0 }, { ...data, stock: -1 }, { ...data, name: "" }, { priceCents: 100 }]) {
    const r = await adminCall("POST", "/products", bad);
    assert.equal(r.status, 400, `ולידציה: ${JSON.stringify(bad)}`);
    assert.equal(r.body.error.code, "VALIDATION_ERROR");
  }

  const upd = await adminCall("PATCH", `/products/${p.id}`, { priceCents: 19900 });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.priceCents, 19900);
  assert.equal(upd.body.name, "מטחנה ידנית", "PATCH — רק מה שנשלח");

  const got = await call("GET", `/products/${p.id}`);
  assert.equal(got.status, 200, "GET /products/:id — ציבורי");
  assert.equal(got.body.priceCents, 19900);
  const missing = await call("GET", "/products/999999");
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, "PRODUCT_NOT_FOUND");

  assert.equal((await adminCall("DELETE", `/products/${p.id}`)).status, 204);
  assert.equal((await call("GET", `/products/${p.id}`)).status, 404, "אחרי מחיקה — 404");
  assert.ok(!(await call("GET", "/products")).body.data.some((x) => x.id === p.id), "ולא ברשימה");
});

test("חיפוש, סינון, מיון ו־pagination", async (t) => {
  const { call, product } = await shop(t);
  await product({ name: "מטחנה ידנית", description: "מטחנת גרעינים קרמית", priceCents: 24900, stock: 3, category: "grinders" });
  await product({ name: "Espresso Cups", description: "set of 4", priceCents: 8900, stock: 0, category: "cups" });
  await product({ name: "קומקום פתיה", description: "Gooseneck kettle", priceCents: 32900, stock: 7, category: "kettles" });
  await product({ name: "Latte Cups", description: "set of 2", priceCents: 6900, stock: 12, category: "cups" });
  const names = async (qs) => {
    const r = await call("GET", `/products${qs}`);
    assert.equal(r.status, 200, `GET /products${qs}: ${JSON.stringify(r.body)}`);
    return r.body.data.map((p) => p.name);
  };
  assert.deepEqual((await names("?sort=price")), ["Latte Cups", "Espresso Cups", "מטחנה ידנית", "קומקום פתיה"]);
  assert.deepEqual((await names("?sort=-price")), ["קומקום פתיה", "מטחנה ידנית", "Espresso Cups", "Latte Cups"]);
  assert.deepEqual((await names("?category=cups&sort=price")), ["Latte Cups", "Espresso Cups"]);
  assert.deepEqual((await names("?q=cups&sort=price")), ["Latte Cups", "Espresso Cups"], "q: בלי תלות באותיות גדולות/קטנות");
  assert.deepEqual((await names("?q=KETTLE")), ["קומקום פתיה"], "q מחפש גם בתיאור");
  assert.deepEqual((await names("?q=מטחנ")), ["מטחנה ידנית"]);
  assert.deepEqual((await names("?minPrice=8000&maxPrice=25000&sort=price")), ["Espresso Cups", "מטחנה ידנית"], "minPrice/maxPrice באגורות, כולל");
  assert.deepEqual((await names("?inStock=true&category=cups")), ["Latte Cups"]);

  const page = await call("GET", "/products?sort=price&limit=3&page=2");
  assert.deepEqual(page.body.data.map((p) => p.name), ["קומקום פתיה"]);
  assert.deepEqual(page.body.meta, { page: 2, limit: 3, total: 4, totalPages: 2 });
  assert.equal((await call("GET", "/products?limit=1000")).status, 400, "limit מוגבל (עד 100)");
  assert.equal((await call("GET", "/products?sort=hack")).status, 400);
});
