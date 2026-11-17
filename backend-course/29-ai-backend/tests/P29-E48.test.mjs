import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { ReviewSummary, parseSummary } = await load(import.meta.url, "P29-E48.ts");
const good = { sentiment: "mixed", pros: ["טוחנת אחיד"], cons: [], average_rating: 3.5, summary_he: "בסדר" };

test("תקין, ושדות נוספים נזרקים", () => {
  assert.deepEqual(parseSummary({ ...good, extra: 1 }), { ok: true, data: good });
  assert.deepEqual(parseSummary({ ...good, average_rating: null }).ok, true);
  assert.equal(typeof ReviewSummary.safeParse, "function");
});
test("בעיות עם path", () => {
  const r = parseSummary({ ...good, sentiment: "great", pros: ["a", "", "c"], average_rating: 7 });
  assert.equal(r.ok, false);
  const paths = r.issues.map((i) => i.split(":")[0]);
  assert.deepEqual(paths.sort(), ["average_rating", "pros.1", "sentiment"]);
  for (const bad of [{ ...good, pros: ["1", "2", "3", "4", "5", "6"] }, { ...good, summary_he: "" }, { ...good, summary_he: "x".repeat(301) }, { ...good, average_rating: 0.5 }, { ...good, cons: undefined }]) {
    assert.equal(parseSummary(bad).ok, false, JSON.stringify(bad).slice(0, 60));
  }
});
