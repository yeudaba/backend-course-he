import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_compare.mjs";
import { code } from "./_ts.mjs";

test("P17-E50: מוצרים שלא נמכרו", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E50.sql", [
    ["אחרי שנמכר V60 ונוסף מוצר חדש", "INSERT INTO order_items VALUES (12, 7, 1, 99); INSERT INTO products (name, category_id, price, stock) VALUES ('Aeropress', 3, 139, 15)"],
  ]);
});
test("P17-E50: בשיטת LEFT JOIN", () => {
  const src = code(import.meta.url, "P17-E50.sql").replace(/--.*$/gm, "");
  assert.match(src, /LEFT\s+(OUTER\s+)?JOIN/i, "המשימה ביקשה LEFT JOIN");
});
