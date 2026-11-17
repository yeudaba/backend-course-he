import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E34.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["Range"])).Range;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("readonly, static ו־getter", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Range } from "FILE";
const r = new Range(1, 5);
// @ts-expect-error — start הוא readonly
r.start = 0;
// @ts-expect-error — length הוא getter בלבד
r.length = 9;
const p: Range = Range.parse("1-2");
const b: boolean = r.overlaps(p);
export { b };
`);
  assert.ok(r.ok, r.message);
});
test("constructor, length, includes, toString", async () => {
  const Range = await get();
  const r = new Range(3, 7);
  assert.equal(r.start, 3);
  assert.equal(r.end, 7);
  assert.equal(r.length, 4);
  assert.deepEqual([2, 3, 5, 7, 8].map((n) => r.includes(n)), [false, true, true, true, false]);
  assert.equal(String(r), "[3, 7]");
  assert.equal(new Range(2, 2).length, 0);
  assert.throws(() => new Range(5, 1), (e) => e instanceof RangeError && e.message === "end קטן מ־start");
});
test("overlaps", async () => {
  const Range = await get();
  const r = new Range(3, 7);
  assert.equal(r.overlaps(new Range(7, 10)), true, "נוגעים בקצה — חופפים");
  assert.equal(r.overlaps(new Range(0, 3)), true);
  assert.equal(r.overlaps(new Range(4, 5)), true);
  assert.equal(r.overlaps(new Range(0, 20)), true);
  assert.equal(r.overlaps(new Range(8, 9)), false);
  assert.equal(r.overlaps(new Range(0, 2.9)), false);
});
test("static parse", async () => {
  const Range = await get();
  const r = Range.parse(" 3 - 7 ");
  assert.ok(r instanceof Range, "parse צריכה להחזיר מופע של Range");
  assert.equal(String(r), "[3, 7]");
  assert.equal(String(Range.parse("0-0.5")), "[0, 0.5]");
  for (const bad of ["3", "3-", "-7", "a-b", "1-2-3", ""]) {
    assert.throws(() => Range.parse(bad), (e) => e instanceof RangeError && e.message === "טווח לא תקין", `parse(${JSON.stringify(bad)})`);
  }
  assert.throws(() => Range.parse("7-3"), { message: "end קטן מ־start" }, "גם טווח מטקסט עובר דרך ה־constructor");
});
