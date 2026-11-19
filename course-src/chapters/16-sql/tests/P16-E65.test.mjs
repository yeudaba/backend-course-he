import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P16-E65: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P16-E65.sql", { seed: "shop.sql" });
});
