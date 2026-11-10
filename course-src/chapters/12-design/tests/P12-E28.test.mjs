import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["ReportService"])).ReportService;

const ORDERS = [
  { id: 1, userId: 7, total: 100, status: "paid" },
  { id: 2, userId: 8, total: 300, status: "paid" },
  { id: 3, userId: 7, total: 250, status: "paid" },
  { id: 4, userId: 9, total: 999, status: "cancelled" },
  { id: 5, userId: 10, total: 300, status: "paid" },
  { id: 6, userId: 11, total: 20, status: "paid" },
  { id: 7, userId: 9, total: 10, status: "paid" },
];
const USERS = [
  { id: 7, name: "דנה" },
  { id: 8, name: "עומר" },
  { id: 9, name: "נועה" },
  { id: 11, name: "יוסי" },
];

function fakes(orders = ORDERS) {
  const calls = { findAll: 0, findByIds: [] };
  const orderRepo = { findAll: async () => { calls.findAll++; return orders.map((o) => ({ ...o })); } };
  const userRepo = { findByIds: async (ids) => { calls.findByIds.push([...ids]); return USERS.filter((u) => ids.includes(u.id)); } };
  return { orderRepo, userRepo, calls };
}

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים: repositories ו־topCustomers", () => {
  const r = typeProbe(
    import.meta.url,
    FILE,
    `import { ReportService, type OrderRepository, type UserRepository } from "FILE";

const orders: OrderRepository = { findAll: async () => [{ id: 1, userId: 1, total: 5, status: "paid" }] };
const users: UserRepository = { findByIds: async (ids) => ids.map((id) => ({ id, name: "x" })) };
// @ts-expect-error — status הוא רק "paid" או "cancelled"
const badOrders: OrderRepository = { findAll: async () => [{ id: 1, userId: 1, total: 5, status: "refunded" }] };
const service = new ReportService(orders, users);
async function main() {
  // topCustomers מחזירה Promise של מערך { name, total }
  const rows: { name: string; total: number }[] = await service.topCustomers(3);
  return rows;
}
// @ts-expect-error — ה־constructor מקבל שני repositories
new ReportService(orders);

export { badOrders, main };
`
  );
  assert.ok(r.ok, r.message);
});
test("שלושת הגדולים: רק paid, שוויון לפי userId", async () => {
  const ReportService = await get();
  const { orderRepo, userRepo } = fakes();
  assert.deepEqual(await new ReportService(orderRepo, userRepo).topCustomers(3), [
    { name: "דנה", total: 350 },
    { name: "עומר", total: 300 },
    { name: "לא ידוע", total: 300 },
  ]);
});
test("משתמש שלא נמצא — \"לא ידוע\", ו־n גדול מכמות הלקוחות", async () => {
  const ReportService = await get();
  const { orderRepo, userRepo } = fakes();
  const rows = await new ReportService(orderRepo, userRepo).topCustomers(100);
  assert.equal(rows.length, 5, "5 לקוחות עם הזמנות paid");
  assert.deepEqual(rows.at(-1), { name: "נועה", total: 10 }, "ההזמנה המבוטלת של נועה (999) לא נספרת");
});
test("קריאה אחת ל־findByIds, רק עם ה־ids שנבחרו", async () => {
  const ReportService = await get();
  const { orderRepo, userRepo, calls } = fakes();
  await new ReportService(orderRepo, userRepo).topCustomers(2);
  assert.equal(calls.findAll, 1, "findAll צריכה להיקרא פעם אחת");
  assert.equal(calls.findByIds.length, 1, `findByIds נקראה ${calls.findByIds.length} פעמים — צריך קריאה אחת לכל הלקוחות (בלי N+1)`);
  assert.deepEqual([...calls.findByIds[0]].sort((a, b) => a - b), [7, 8], "findByIds צריכה לקבל רק את ה־ids של 2 הלקוחות שנבחרו");
});
test("אין הזמנות", async () => {
  const ReportService = await get();
  const { orderRepo, userRepo } = fakes([]);
  assert.deepEqual(await new ReportService(orderRepo, userRepo).topCustomers(3), []);
});
