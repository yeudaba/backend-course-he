import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E66.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["StatsService"])).StatsService;
const repoOf = (orders) => ({ async findAll() { return orders.map((o) => ({ ...o })); } });
const o = (id, total, status, createdAt) => ({ id, total, status, createdAt });

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { StatsService } from "FILE";
import type { OrderRepository, Order } from "FILE";
const repo: OrderRepository = { async findAll(): Promise<Order[]> { return []; } };
const p: Promise<Map<string, number>> = new StatsService(repo).revenueByMonth(2026);
// @ts-expect-error — status רק paid/refunded/pending
const bad: Order = { id: 1, total: 1, status: "cancelled", createdAt: "" };
export { p, bad };
`);
  assert.ok(r.ok, r.message);
});
test("12 חודשים, לפי הסדר, גם בלי הזמנות", async () => {
  const StatsService = await get();
  const m = await new StatsService(repoOf([])).revenueByMonth(2025);
  assert.ok(m instanceof Map);
  assert.deepEqual([...m.keys()], ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"]);
  assert.ok([...m.values()].every((v) => v === 0));
});
test("paid מוסיף, refunded מוריד, pending ושנים אחרות לא נספרים", async () => {
  const StatsService = await get();
  const orders = [
    o(1, 100.1, "paid", "2026-01-05T10:00:00Z"),
    o(2, 50.2, "paid", "2026-01-20T10:00:00Z"),
    o(3, 30, "refunded", "2026-03-01T10:00:00Z"),
    o(4, 999, "pending", "2026-03-02T10:00:00Z"),
    o(5, 70, "paid", "2025-12-31T23:30:00Z"),
    o(6, 0.1, "paid", "2026-12-31T23:59:59Z"),
    o(7, 0.2, "paid", "2026-12-01T00:00:00Z"),
    o(8, 10, "paid", "2027-01-01T00:00:00Z"),
  ];
  const m = await new StatsService(repoOf(orders)).revenueByMonth(2026);
  assert.equal(m.get("2026-01"), 150.3);
  assert.equal(m.get("2026-02"), 0);
  assert.equal(m.get("2026-03"), -30);
  assert.equal(m.get("2026-12"), 0.3, "מעוגל לשתי ספרות");
  assert.equal(m.size, 12, "רק חודשי השנה המבוקשת");
});
