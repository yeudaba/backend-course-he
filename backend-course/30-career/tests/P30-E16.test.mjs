import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P30-E16: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P30-E16.sql", { seed: "sales.sql" });
});
