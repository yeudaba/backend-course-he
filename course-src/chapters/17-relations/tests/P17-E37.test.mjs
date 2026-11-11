import { test } from "node:test";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E37: ההזמנות של לקוחה 1, מהישנה לחדשה", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E37.sql", [
    ["אחרי שנוספה לדנה הזמנה ישנה (ינואר 2025)", "INSERT INTO orders (customer_id, status, created_at) VALUES (1, 'shipped', '2025-01-01 10:00+02'), (2, 'paid', '2024-01-01 10:00+02')"],
  ]);
});
