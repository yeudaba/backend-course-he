import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P16-E82: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P16-E82.sql", {
    seed: "shop.sql",
    changes: [["לקוח חדש מחיפה, ולקוח מ־haifa באותיות קטנות", "INSERT INTO customers (full_name, email, city, phone, joined_on) VALUES ('Eli Ben', 'eli@example.com', 'Haifa', '050-9999999', '2026-10-01'), ('Rina Tal', 'rina@example.com', 'haifa', NULL, '2026-10-02')"]],
  });
});
