import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_compare.mjs";
import { code } from "./_ts.mjs";

test("P17-E76: ממוצע הזמנה לפי עיר", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E76.sql", [
    ["אחרי הזמנות חדשות (גם מבוטלת, וגם ללקוח בלי עיר)", `
      INSERT INTO orders (customer_id, status, created_at) VALUES (4, 'paid', '2026-05-20 10:00+03'), (7, 'cancelled', '2026-05-21 10:00+03'), (2, 'paid', '2026-05-22 10:00+03');
      INSERT INTO order_items VALUES (13, 5, 1, 649), (13, 9, 3, 24.9), (14, 5, 2, 649), (15, 3, 1, 29.9);`],
  ]);
});
test("P17-E76: עם WITH", () => {
  const src = code(import.meta.url, "P17-E76.sql").replace(/--.*$/gm, "");
  assert.match(src, /^\s*WITH\b/im, "המשימה ביקשה WITH");
});
