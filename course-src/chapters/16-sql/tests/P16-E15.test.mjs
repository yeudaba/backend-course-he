import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P16-E15: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P16-E15.sql", { seed: "shop.sql" });
});
