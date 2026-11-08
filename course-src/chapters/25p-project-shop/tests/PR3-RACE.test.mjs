import { test } from "node:test";
import assert from "node:assert/strict";
import { shop, key } from "./_shop.mjs";

// פרויקט 3, שלב 2: נכונות תחת מקביליות — מול PostgreSQL אמיתי
test("12 לקוחות, 3 יחידות במלאי — בדיוק 3 הזמנות", async (t) => {
  const { customer, product, call, db } = await shop(t);
  const p = await product({ name: "מכונה במבצע", priceCents: 99900, stock: 3 });
  const users = await Promise.all(Array.from({ length: 12 }, () => customer()));
  for (const u of users) assert.equal((await u("PUT", `/cart/items/${p.id}`, { quantity: 1 })).status, 200);
  const results = await Promise.all(users.map((u) => u("POST", "/orders", undefined, key())));
  const statuses = results.map((r) => r.status).sort();
  assert.deepEqual(statuses, [201, 201, 201, ...Array(9).fill(409)], `בדיוק 3 הצליחו, השאר 409 OUT_OF_STOCK: ${statuses}`);
  assert.ok(results.filter((r) => r.status === 409).every((r) => r.body.error.code === "OUT_OF_STOCK"));
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 0, "מלאי 0 — לא שלילי");
});

test("לחיצה כפולה על \"הזמן\" — הזמנה אחת", async (t) => {
  const { customer, product, call } = await shop(t);
  const p = await product({ stock: 10 });
  const dana = await customer();
  await dana("PUT", `/cart/items/${p.id}`, { quantity: 2 });
  const k = key("double");
  const results = await Promise.all(Array.from({ length: 5 }, () => dana("POST", "/orders", undefined, k)));
  const ok = results.filter((r) => r.status === 201);
  assert.ok(ok.length >= 1 && results.every((r) => r.status === 201 || r.status === 409), `201 (או 409 בזמן שהראשונה בטיפול): ${results.map((r) => r.status)}`);
  assert.equal(new Set(ok.map((r) => r.body.id)).size, 1, "כל ה־201 — אותה הזמנה");
  assert.equal((await dana("GET", "/orders")).body.meta.total, 1);
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 8, "המלאי ירד פעם אחת");
});

test("רשת ביטחון במסד: CHECK על המלאי", async (t) => {
  const { db } = await shop(t);
  const checks = await db.query(`SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE contype = 'c'`);
  assert.ok(
    checks.rows.some((r) => /stock[^a-z_]*>=\s*0|stock[^a-z_]*>\s*\(?-1/i.test(r.def)),
    `CHECK (stock >= 0) במסד — גם אם יש באג בקוד, המסד לא ישמור מלאי שלילי. נמצאו: ${checks.rows.map((r) => r.def).join(" | ") || "אין"}`,
  );
});
