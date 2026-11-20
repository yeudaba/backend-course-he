import { test } from "node:test";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E82: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E82.sql", [
    ["ההזמנה האחרונה של לקוח 7 בוטלה", "INSERT INTO orders (customer_id, status, created_at) VALUES (7, 'cancelled', '2026-06-01 10:00:00+03')"],
    ["שתי הזמנות של לקוח 2 באותו רגע", "INSERT INTO orders (customer_id, status, created_at) VALUES (2, 'paid', '2026-06-02 09:00:00+03'), (2, 'pending', '2026-06-02 09:00:00+03')"],
    ["לקוח שכל ההזמנות שלו בוטלו", "UPDATE orders SET status = 'cancelled' WHERE customer_id = 6"],
  ]);
});
