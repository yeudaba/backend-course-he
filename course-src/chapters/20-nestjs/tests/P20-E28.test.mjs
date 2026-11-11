import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const FILE = "P20-E28.ts";
function load() {
  const m = loadNest(import.meta.url, FILE);
  for (const name of ["SummaryModule", "CUSTOMERS_REPOSITORY", "ORDERS_REPOSITORY"]) {
    assert.ok(m[name], `הקובץ לא מייצא את ${name}. כתוב export לפני ההגדרה`);
  }
  return m;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// repositories מזויפים: כל קריאה לוקחת 80ms
function fakes() {
  const calls = [];
  const customers = { findById: async (id) => { calls.push(`customer ${id}`); await sleep(80); return id === 7 ? { id: 7, fullName: "Noa Mizrahi" } : null; } };
  const orders = {
    findByCustomer: async (id) => {
      calls.push(`orders ${id}`);
      await sleep(80);
      return id === 7
        ? [
            { id: 1, customerId: 7, total: 19.9, status: "paid" },
            { id: 2, customerId: 7, total: 19.9, status: "paid" },
            { id: 3, customerId: 7, total: 19.9, status: "paid" },
            { id: 4, customerId: 7, total: 500, status: "cancelled" },
          ]
        : [];
    },
  };
  return { customers, orders, calls };
}

test("ה־module עובד עם ה־repositories בזיכרון", async (t) => {
  const { SummaryModule } = load();
  const { call } = await nestApp(t, SummaryModule);
  const r = await call("GET", "/customers/1/summary");
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { customer: { id: 1, fullName: "Dana Levi" }, orders: 1, total: 120.5 });
});
test("דרך ה־tokens, במקביל, ובאגורות", async (t) => {
  const { SummaryModule, CUSTOMERS_REPOSITORY, ORDERS_REPOSITORY } = load();
  const f = fakes();
  const { call } = await nestApp(t, SummaryModule, { overrides: [[CUSTOMERS_REPOSITORY, f.customers], [ORDERS_REPOSITORY, f.orders]] });
  const start = Date.now();
  const r = await call("GET", "/customers/7/summary");
  const ms = Date.now() - start;
  assert.deepEqual(r.body, { customer: { id: 7, fullName: "Noa Mizrahi" }, orders: 3, total: 59.7 }, "רק הזמנות paid, וסכום מדויק (59.7 ולא 59.699999999999996)");
  assert.deepEqual([...f.calls].sort(), ["customer 7", "orders 7"], "ה־service צריך לעבור דרך שני ה־repositories המוזרקים (@Inject(TOKEN))");
  assert.ok(ms < 150, `לקח ${ms}ms — שתי הקריאות (80ms כל אחת) צריכות לצאת יחד (Promise.all)`);
});
test("לקוח לא קיים ← 404, ‏id לא מספר ← 400", async (t) => {
  const { SummaryModule, CUSTOMERS_REPOSITORY, ORDERS_REPOSITORY } = load();
  const f = fakes();
  const { call } = await nestApp(t, SummaryModule, { overrides: [[CUSTOMERS_REPOSITORY, f.customers], [ORDERS_REPOSITORY, f.orders]] });
  const r = await call("GET", "/customers/99/summary");
  assert.equal(r.status, 404);
  assert.equal(r.body?.message, "לקוח 99 לא נמצא");
  assert.equal((await call("GET", "/customers/abc/summary")).status, 400, "ParseIntPipe");
});
