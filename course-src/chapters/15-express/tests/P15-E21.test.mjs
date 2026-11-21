import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E21.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("מוצרים ו־X-Response-Time", async (t) => {
  const call = await start(t, createApp());
  const errors = [];
  const orig = console.error;
  console.error = (...a) => errors.push(a.join(" "));
  try {
    let res = await call("GET", "/products/1");
    assert.equal(res.status, 200, "GET /products/1 — המוצר קיים");
    assert.deepEqual(res.body, { id: 1, name: "מקלדת" }, "GET /products/1");
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/, "GET /products/1 — חסר X-Response-Time (או שהוא לא בצורה '3ms')");
    res = await call("GET", "/products/abc");
    assert.equal(res.status, 400, "GET /products/abc");
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/, "GET /products/abc — חסר X-Response-Time");
    res = await call("GET", "/products/2");
    assert.equal(res.status, 404, "GET /products/2 — אין מוצר כזה");
    assert.match(res.headers.get("x-response-time") ?? "", /^\d+ms$/, "GET /products/2 — חסר X-Response-Time");
    await new Promise((r) => setTimeout(r, 20));
  } finally {
    console.error = orig;
  }
  assert.deepEqual(errors, [], "לא אמורות להיות שגיאות ביומן");
});
test("X-Response-Time מודד עד רגע השליחה", async (t) => {
  const app = createApp();
  // route איטי שהבודק מוסיף: עונה אחרי 60ms
  app.get("/slow", async (req, res) => {
    await new Promise((r) => setTimeout(r, 60));
    res.json({ ok: true });
  });
  const call = await start(t, app);
  const res = await call("GET", "/slow");
  assert.equal(res.status, 200, "GET /slow (route שהבודק הוסיף)");
  const header = res.headers.get("x-response-time") ?? "";
  assert.match(header, /^\d+ms$/, "GET /slow — חסר X-Response-Time");
  assert.ok(parseInt(header, 10) >= 55, `GET /slow עונה אחרי 60ms, אבל X-Response-Time הוא "${header}". ה־header צריך להיקבע רגע לפני השליחה, לא בתחילת הבקשה`);
});
