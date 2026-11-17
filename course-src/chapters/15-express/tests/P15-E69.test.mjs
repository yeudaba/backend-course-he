import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E69.ts";
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("הכול תקין ← 201, ids רצים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  let r = await call("POST", "/products/bulk", [{ name: " עט ", price: 450 }, { name: "דף", price: 20 }]);
  assert.deepEqual([r.status, r.body], [201, { created: [{ id: 1, name: "עט", price: 450 }, { id: 2, name: "דף", price: 20 }] }]);
  r = await call("POST", "/products/bulk", [{ name: "עט", price: 1 }]);
  assert.deepEqual(r.body, { created: [{ id: 3, name: "עט", price: 1 }] }, "כפילות רק בתוך אותה בקשה");
  assert.equal((await call("GET", "/products")).body.length, 3);
});
test("שגיאות — כולן, לפי הסדר, ושום דבר לא נשמר", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const r = await call("POST", "/products/bulk", [
    { name: "עט", price: 450 },
    { name: "", price: 10 },
    { name: "עט ", price: 5 },
    { name: "דף", price: 1.5 },
    { name: 5, price: -1 },
    { name: "ספר", price: "10" },
    null,
    { name: "Pen", price: 1 },
    { name: "pen", price: 1 },
  ]);
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, {
    error: {
      code: "VALIDATION_ERROR",
      message: "חלק מהמוצרים לא תקינים",
      details: [
        { index: 1, message: "name לא תקין" },
        { index: 2, message: "שם כפול" },
        { index: 3, message: "price לא תקין" },
        { index: 4, message: "name לא תקין" },
        { index: 5, message: "price לא תקין" },
        { index: 6, message: "name לא תקין" },
        { index: 8, message: "שם כפול" },
      ],
    },
  });
  assert.deepEqual((await call("GET", "/products")).body, [], "שום מוצר לא נשמר");
  const ok = await call("POST", "/products/bulk", [{ name: "x", price: 1 }]);
  assert.equal(ok.body.created[0].id, 1, "בקשה שנכשלה לא צרכה ids");
});
test("לא מערך, ריק, או יותר מ־100", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const ERR = { error: { code: "VALIDATION_ERROR", message: "שלח מערך של 1–100 מוצרים" } };
  for (const body of [{ name: "x", price: 1 }, [], Array.from({ length: 101 }, (_, i) => ({ name: `p${i}`, price: 1 }))]) {
    const r = await call("POST", "/products/bulk", body);
    assert.deepEqual([r.status, r.body], [400, ERR]);
  }
  const r = await call("POST", "/products/bulk", Array.from({ length: 100 }, (_, i) => ({ name: `p${i}`, price: 1 })));
  assert.equal(r.status, 201);
});
