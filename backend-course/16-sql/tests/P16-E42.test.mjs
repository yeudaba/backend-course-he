import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P16-E42: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P16-E42.sql", { seed: "shop.sql" });
});
