import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E70.mjs", ["formatDue"])).formatDue;
test("formatDue", async () => {
  const f = await get();
  const cases = [
    [null, "2026-10-24", "בלי תאריך"],
    ["2026-10-24", "2026-10-24", "היום"],
    ["2026-10-25", "2026-10-24", "מחר"],
    ["2026-10-23", "2026-10-24", "אתמול"],
    ["2026-11-03", "2026-10-24", "בעוד 10 ימים"],
    ["2026-10-01", "2026-10-24", "באיחור של 23 ימים"],
    ["2026-10-26", "2026-10-24", "בעוד 2 ימים"],
    ["2027-01-01", "2026-12-31", "מחר"],
    ["2026-03-01", "2026-02-28", "מחר"],
    ["2028-03-01", "2028-02-28", "בעוד 2 ימים"],
    ["2026-03-26", "2026-03-28", "באיחור של 2 ימים"],
  ];
  for (const [due, today, want] of cases) assert.equal(f(due, today), want, `formatDue(${JSON.stringify(due)}, "${today}")`);
  assert.equal(f(undefined, "2026-01-01"), "בלי תאריך");
});
