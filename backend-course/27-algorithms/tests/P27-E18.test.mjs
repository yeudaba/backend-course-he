import { test } from "node:test";
import { sameAsSolution } from "../../tools/sql.mjs";

test("P27-E18: התוצאה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P27-E18.sql", { seed: "interview.sql" });
});
