import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_compare.mjs";
import { code } from "./_ts.mjs";

test("P17-E75: לקוחות עם הזמנה ממתינה", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E75.sql", [
    ["אחרי שלמיכל נוספה עוד הזמנה ממתינה ולעומר — ראשונה", "INSERT INTO orders (customer_id, status, created_at) VALUES (5, 'pending', '2026-05-04 10:00+03'), (8, 'pending', '2026-05-05 10:00+03'); UPDATE orders SET status = 'paid' WHERE id = 12"],
  ]);
});
test("P17-E75: עם IN ובלי JOIN", () => {
  const src = code(import.meta.url, "P17-E75.sql").replace(/--.*$/gm, "");
  assert.match(src, /\bIN\s*\(\s*SELECT/i, "המשימה ביקשה IN עם תת־שאילתה");
  assert.doesNotMatch(src, /\bJOIN\b/i, "בלי JOIN");
});
