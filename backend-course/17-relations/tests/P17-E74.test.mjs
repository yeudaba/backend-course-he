import { test } from "node:test";
import assert from "node:assert/strict";
import { sameAsSolution } from "./_compare.mjs";
import { code } from "./_ts.mjs";

test("P17-E74: קטגוריות בלי מוצר פעיל", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E74.sql", [
    ["אחרי ששתי המטחנות ירדו מהמדף ונוספה קטגוריה ריקה", "UPDATE products SET is_active = false WHERE category_id = 2; INSERT INTO categories (name) VALUES ('tea')"],
  ]);
});
test("P17-E74: בשיטת NOT EXISTS", () => {
  const src = code(import.meta.url, "P17-E74.sql").replace(/--.*$/gm, "");
  assert.match(src, /NOT\s+EXISTS/i, "המשימה ביקשה NOT EXISTS");
});
