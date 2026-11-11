import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E75.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ValidationError", "parseFilters"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseFilters } from "FILE";
const f = parseFilters({ minPrice: "1" });
const tags: string[] = f.tags;
const s: boolean = f.inStock;
const min: number | undefined = f.minPrice;
// @ts-expect-error — minPrice יכול להיות undefined
const sure: number = f.minPrice;
export { tags, s, min, sure };
`);
  assert.ok(r.ok, r.message);
});
test("תקינים", async () => {
  const { parseFilters } = await get();
  assert.deepEqual(parseFilters({ minPrice: "10", tags: "a, B,,c,a", inStock: "true" }), { minPrice: 10, tags: ["a", "b", "c"], inStock: true });
  const empty = parseFilters({});
  assert.deepEqual(empty, { tags: [], inStock: false });
  assert.ok(!("minPrice" in empty) && !("maxPrice" in empty), "בלי שדות undefined בתוצאה");
  assert.deepEqual(parseFilters({ minPrice: " ", maxPrice: " 19.90 ", inStock: "false" }), { maxPrice: 19.9, tags: [], inStock: false });
  assert.deepEqual(parseFilters({ minPrice: "0", maxPrice: "0" }), { minPrice: 0, maxPrice: 0, tags: [], inStock: false });
});
test("שגיאות", async () => {
  const { parseFilters, ValidationError } = await get();
  const cases = [
    [{ minPrice: "abc" }, "minPrice", "minPrice לא תקין"],
    [{ minPrice: "-5" }, "minPrice", "minPrice לא תקין"],
    [{ maxPrice: "1e3" }, "maxPrice", "maxPrice לא תקין"],
    [{ maxPrice: "0x10" }, "maxPrice", "maxPrice לא תקין"],
    [{ maxPrice: "5." }, "maxPrice", "maxPrice לא תקין"],
    [{ minPrice: "50", maxPrice: "10" }, "minPrice", "minPrice גדול מ־maxPrice"],
    [{ inStock: "yes" }, "inStock", "inStock לא תקין"],
    [{ inStock: "" }, "inStock", "inStock לא תקין"],
    [{ inStock: "TRUE" }, "inStock", "inStock לא תקין"],
  ];
  for (const [q, field, message] of cases) {
    assert.throws(() => parseFilters(q), (e) => e instanceof ValidationError && e.field === field && e.message === message, `${JSON.stringify(q)} ← ${message}`);
  }
});
