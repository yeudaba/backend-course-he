import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P17-E07: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E07.sql", { seed: "store.sql" });
});
