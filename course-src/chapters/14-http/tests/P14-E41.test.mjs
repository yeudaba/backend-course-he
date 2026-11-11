import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E41.mjs", ["countByCategory"])).countByCategory;

test("רשימה ריקה ← כל המפתחות עם 0", async () => {
  const f = await get();
  assert.deepEqual(f([]), { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, invalid: 0 });
});
test("ספירה לפי טווח", async () => {
  const f = await get();
  const lines = ["GET /products 200 12", "POST /orders 201 40", "GET /a 204 1", "GET /old 301 2", "GET /x 404 3", "GET /y 429 3", "GET /z 503 1000", "PUT /p 500 9"];
  assert.deepEqual(f(lines), { "2xx": 3, "3xx": 1, "4xx": 2, "5xx": 2, invalid: 0 });
});
test("שורות לא תקינות, ריקות ורווחים כפולים", async () => {
  const f = await get();
  const lines = ["", "   ", "oops", "GET /z 99 1", "GET /z 600 1", "GET /z 2O0 1", "GET /z 200.5 1", "GET /a 200", "GET /a 200 1 extra", "  GET  /a  301  5  ", "GET /b 101 1", "GET /c 404 7"];
  assert.deepEqual(f(lines), { "2xx": 0, "3xx": 1, "4xx": 1, "5xx": 0, invalid: 7 }, "שורה ריקה לא נספרת; 1xx תקין אבל לא בטווח; רווחים כפולים בסדר");
});
