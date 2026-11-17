import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { weVsI } = await load(import.meta.url, "P30-E72.ts");

test("ספירה והערכה", () => {
  assert.deepEqual(weVsI("We had a problem with orders. We looked at it and we fixed it. Our tests passed."), { we: 4, i: 0, verdict: "say_i" });
  assert.deepEqual(weVsI("I wrote the test; we're a team of 3 but I'm the one who found it. My fix."), { we: 1, i: 3, verdict: "ok" });
  assert.deepEqual(weVsI("We've seen it, we said it, I did it, us."), { we: 3, i: 1, verdict: "more_we" });
  assert.deepEqual(weVsI("אנחנו בנינו, אני בדקתי, הקוד שלי, הצוות שלנו"), { we: 2, i: 2, verdict: "ok" });
  assert.deepEqual(weVsI("It is in the index, items, wiki"), { we: 0, i: 0, verdict: "ok" }, "‏i בתוך מילים לא נספר");
  assert.deepEqual(weVsI(""), { we: 0, i: 0, verdict: "ok" });
});
