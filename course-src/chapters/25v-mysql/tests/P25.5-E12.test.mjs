import { test } from "node:test";
import { sameAsSolution } from "../../tools/mysql.mjs";

test("P25.5-E12: התוצאה (עמודות, שורות וסדר) — מול MySQL", async (t) => {
  await sameAsSolution(t, import.meta.url, "P25.5-E12.sql", { seed: "shop.sql" });
});
