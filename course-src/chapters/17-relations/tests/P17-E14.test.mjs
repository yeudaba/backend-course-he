import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P17-E14: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E14.sql", { seed: "store.sql" });
});
