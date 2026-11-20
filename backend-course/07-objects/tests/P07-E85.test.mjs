import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P07-E85.js";
const get = () => exportsOf(import.meta.url, FILE, ["countByMonth"]);

test("ספירה לפי חודש ב־UTC", async () => {
  const { countByMonth } = await get();
  const orders = [
    { id: 1, createdAt: "2026-03-05T10:00:00Z" },
    { id: 2, createdAt: "2026-03-31T23:30:00Z" },
    { id: 3, createdAt: "2026-04-01T00:10:00+02:00" },
    { id: 5, createdAt: "2026-04-01T09:00:00Z" },
  ];
  assert.deepEqual(countByMonth(orders), { "2026-03": 3, "2026-04": 1 }, "הזמנה 3 היא 22:10 ב־UTC של 31.3 — מרץ");
});
test("חודשים עם אפס מוביל ומעבר שנה", async () => {
  const { countByMonth } = await get();
  const orders = [
    { id: 1, createdAt: "2026-12-31T23:59:00Z" },
    { id: 2, createdAt: "2027-01-01T00:00:00Z" },
    { id: 3, createdAt: "2027-01-15T12:00:00Z" },
  ];
  assert.deepEqual(countByMonth(orders), { "2026-12": 1, "2027-01": 2 });
});
test("תאריך לא תקין — מדלגים, בלי לקרוס", async () => {
  const { countByMonth } = await get();
  assert.deepEqual(countByMonth([{ id: 4, createdAt: "לא ידוע" }, { id: 5, createdAt: "2026-05-01T08:00:00Z" }]), { "2026-05": 1 });
  assert.deepEqual(countByMonth([]), {});
});
test("המקור לא משתנה", async () => {
  const { countByMonth } = await get();
  const orders = [{ id: 1, createdAt: "2026-03-05T10:00:00Z" }];
  countByMonth(orders);
  assert.deepEqual(orders, [{ id: 1, createdAt: "2026-03-05T10:00:00Z" }]);
});
