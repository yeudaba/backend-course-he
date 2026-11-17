import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_compare.mjs";
import { code } from "./_ts.mjs";

test("P17-E73: ההזמנה האחרונה", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E73.sql", [
    ["אחרי ששתי הזמנות חדשות נוצרו באותו רגע", "INSERT INTO orders (customer_id, status, created_at) VALUES (8, 'paid', '2026-06-01 12:00+03'), (4, 'pending', '2026-06-01 12:00+03'), (2, 'paid', '2026-05-30 12:00+03')"],
  ]);
});
test("P17-E73: עם תת־שאילתה", () => {
  const src = code(import.meta.url, "P17-E73.sql").replace(/--.*$/gm, "");
  assert.match(src, /\(\s*SELECT/i, "המשימה ביקשה תת־שאילתה כערך");
  assert.doesNotMatch(src, /\bLIMIT\b/i, "בלי LIMIT");
});
