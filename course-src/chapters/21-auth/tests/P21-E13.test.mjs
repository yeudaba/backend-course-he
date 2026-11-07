import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ReportsModule } = loadNest(import.meta.url, "P21-E13.ts");
const as = (role) => ({ headers: { "x-user-id": "1", "x-user-role": role } });

test("תפקידים", async (t) => {
  const { call } = await nestApp(t, ReportsModule);
  assert.equal((await call("GET", "/reports")).status, 401, "לא מחובר ← 401, לא 403");
  let res = await call("GET", "/reports", undefined, as("user"));
  assert.equal(res.status, 403);
  assert.equal(res.body.message, "אין הרשאה");
  assert.equal((await call("GET", "/reports", undefined, as("manager"))).status, 200);
  assert.equal((await call("GET", "/reports", undefined, as("admin"))).status, 200);
  assert.equal((await call("DELETE", "/reports/1", undefined, as("manager"))).status, 403, "@Roles על המתודה גובר על ה־class");
  assert.equal((await call("DELETE", "/reports/1", undefined, as("admin"))).status, 204);
  assert.equal((await call("GET", "/profile", undefined, as("user"))).status, 200, "בלי @Roles — כל מחובר");
});
