import { test } from "node:test";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E51: ההזמנות עם Ceramic Mug", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E51.sql", [
    ["אחרי שהספל קיבל מספר אחר (נמחק ונוצר מחדש) ונוספה הזמנה", `
      INSERT INTO products (name, category_id, price, stock) VALUES ('Mug Holder', 4, 15, 10);
      UPDATE products SET name = 'Old Mug' WHERE id = 10;
      INSERT INTO products (name, category_id, price, stock) VALUES ('Ceramic Mug', 4, 42, 30);
      INSERT INTO orders (customer_id, status, created_at) VALUES (8, 'paid', '2026-06-01 00:30:00+03');
      INSERT INTO order_items VALUES (13, 14, 5, 42), (13, 13, 1, 15);`],
  ]);
});
