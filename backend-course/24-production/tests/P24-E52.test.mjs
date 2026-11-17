import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E52.ts", ["ageOn", "ageAt"]);

test("ageOn — לפני, ביום ואחרי יום ההולדת", async () => {
  const { ageOn } = await get();
  assert.equal(ageOn("1990-05-17", "2026-05-16"), 35);
  assert.equal(ageOn("1990-05-17", "2026-05-17"), 36, "יום ההולדת עצמו נספר");
  assert.equal(ageOn("1990-05-17", "2026-12-31"), 36);
  assert.equal(ageOn("1990-12-31", "2026-01-01"), 35);
  assert.equal(ageOn("2026-11-05", "2026-11-05"), 0);
  assert.equal(ageOn("2025-11-06", "2026-11-05"), 0);
  assert.equal(ageOn("2025-11-05", "2026-11-05"), 1);
});
test("29 בפברואר", async () => {
  const { ageOn } = await get();
  assert.equal(ageOn("2004-02-29", "2026-02-28"), 21);
  assert.equal(ageOn("2004-02-29", "2026-03-01"), 22);
  assert.equal(ageOn("2004-02-29", "2028-02-28"), 23);
  assert.equal(ageOn("2004-02-29", "2028-02-29"), 24, "בשנה מעוברת — ביום עצמו");
});
test("קלט לא תקין ← RangeError", async () => {
  const { ageOn } = await get();
  for (const [b, t] of [["2026-02-30", "2026-03-01"], ["1990-13-01", "2026-01-01"], ["1990-5-17", "2026-01-01"], ["17/05/1990", "2026-01-01"], ["1990-05-17", "2026-02-29"], ["", "2026-01-01"]]) {
    assert.throws(() => ageOn(b, t), RangeError, `${b} / ${t}`);
  }
  assert.throws(() => ageOn("2026-11-06", "2026-11-05"), RangeError, "לידה אחרי היום");
});
test("ageAt — לפי היום באזור", async () => {
  const { ageAt } = await get();
  const at = new Date("2026-11-04T22:30:00Z");
  assert.equal(ageAt("2000-11-05", at, "Asia/Jerusalem"), 26, "בישראל כבר 5.11");
  assert.equal(ageAt("2000-11-05", at, "UTC"), 25);
  assert.equal(ageAt("2000-11-04", new Date("2026-11-04T03:00:00Z"), "America/Los_Angeles"), 25, "בלוס אנג'לס עוד 3.11");
});
