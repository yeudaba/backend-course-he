import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P27-E23: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P27-E23.sql", { seed: "interview.sql" });
});
