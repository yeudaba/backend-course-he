import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { lintCommit } = await load(import.meta.url, "P30-E09.ts");

test("הודעה טובה — בלי בעיות", () => {
  assert.deepEqual(lintCommit("Prevent overselling with a conditional UPDATE\n\nTwo concurrent orders for the last unit both passed the stock check.\nThe UPDATE now runs WHERE stock >= qty and checks the row count."), []);
  assert.deepEqual(lintCommit("Add Redis cache for the product list\n"), []);
});
test("נושא: ריק, ארוך, נקודה בסוף, לא אומר כלום", () => {
  assert.deepEqual(lintCommit(""), ["שורת נושא ריקה"]);
  assert.equal(lintCommit("A".repeat(73) + " x").length, 1);
  assert.match(lintCommit("Add Redis cache.")[0], /נקודה/);
  for (const m of ["wip", "fix", "update", "asdf", "stuff"]) assert.equal(lintCommit(m).length, 1, m);
});
test("גוף: שורה ריקה אחרי הנושא, ושורות עד 100", () => {
  assert.match(lintCommit("Add cache\nbecause it was slow").join(), /שורה ריקה/);
  assert.match(lintCommit("Add cache\n\n" + "x".repeat(101)).join(), /שורה 3/);
});
