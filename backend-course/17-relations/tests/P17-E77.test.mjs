import { test } from "node:test";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E77: דירוג מחירים בכל קטגוריה", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E77.sql", [
    ["אחרי ששני מוצרים הגיעו לאותו מחיר ומוצר יקר ירד מהמדף", "UPDATE products SET price = 149 WHERE id = 6; UPDATE products SET is_active = false WHERE id = 12; INSERT INTO products (name, category_id, price, stock) VALUES ('Aeropress', 3, 149, 4)"],
  ]);
});
