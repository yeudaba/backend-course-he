import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P12-E73.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ValidationError", "parseId"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (unknown, field?) => number", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseId, ValidationError } from "FILE";
const raw: unknown = "5";
const n: number = parseId(raw);
const m: number = parseId(raw, "userId");
const f: string = new ValidationError("a", "b").field;
export { n, m, f };
`);
  assert.ok(r.ok, r.message);
});
test("תקינים", async () => {
  const { parseId } = await get();
  assert.equal(parseId(7), 7);
  assert.equal(parseId(" 42 "), 42);
  assert.equal(parseId("007"), 7);
  assert.equal(parseId(1), 1);
});
test("לא תקינים ← ValidationError עם field", async () => {
  const { parseId, ValidationError } = await get();
  for (const bad of [0, -1, 3.5, NaN, Infinity, "", "  ", "0", "000", "12abc", "1e3", "-5", "0x10", "3.0", true, null, undefined, [], {}, "99999999999999999999"]) {
    assert.throws(() => parseId(bad), (e) => e instanceof ValidationError && e.field === "id" && e.message === "id חייב להיות מספר שלם חיובי", `parseId(${JSON.stringify(bad)})`);
  }
  assert.throws(() => parseId("x", "userId"), (e) => e instanceof ValidationError && e.field === "userId" && e.message === "userId חייב להיות מספר שלם חיובי" && e.name === "ValidationError");
});
test("בלי any", () => {
  assert.ok(!/\bany\b/.test(code(import.meta.url, FILE)), "בלי any");
});
