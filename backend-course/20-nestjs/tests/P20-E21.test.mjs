import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ReportsModule } = loadNest(import.meta.url, "P20-E21.ts");

test("query עם מספרים", async (t) => {
  const { call } = await nestApp(t, ReportsModule, { validation: true });
  const res = await call("GET", "/reports?page=2&limit=3");
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.page, 2);
  assert.equal(res.body.limit, 3);
  assert.equal((await call("GET", "/reports")).body.limit, 5);
  assert.equal((await call("GET", "/reports?limit=21")).status, 400);
});
test("note אופציונלי מתקבל", async (t) => {
  const { call } = await nestApp(t, ReportsModule, { validation: true });
  let res = await call("POST", "/reports", { title: "רבעון 3", note: "טיוטה" });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.deepEqual(res.body, { id: 1, title: "רבעון 3", note: "טיוטה" });
  res = await call("POST", "/reports", { title: "בלי הערה" });
  assert.deepEqual(res.body, { id: 2, title: "בלי הערה", note: null });
  assert.equal((await call("POST", "/reports", { title: "x", note: 5 })).status, 400);
});
test("דוח שלא קיים ← 404", async (t) => {
  const { call } = await nestApp(t, ReportsModule, { validation: true });
  const res = await call("GET", "/reports/7");
  assert.equal(res.status, 404);
  assert.equal(res.body.message, "דוח 7 לא נמצא");
});
