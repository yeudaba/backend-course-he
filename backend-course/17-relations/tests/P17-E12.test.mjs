import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P17-E12: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E12.sql", { seed: "store.sql" });
});
