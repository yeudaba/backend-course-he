import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P16-E81: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P16-E81.sql", {
    seed: "shop.sql",
    changes: [["מוצר brewing חדש", "INSERT INTO products (name, category, price, stock, is_active, added_on) VALUES ('Cold Brew Jar', 'brewing', 59.00, 4, true, '2026-08-01')"]],
  });
});
