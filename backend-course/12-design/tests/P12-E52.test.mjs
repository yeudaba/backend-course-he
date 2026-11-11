import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E52.ts";
const get = () => exportsOf(import.meta.url, FILE, ["LineError", "ImportError", "parseExpenses"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { LineError, ImportError, parseExpenses } from "FILE";
const rows: { title: string; amount: number }[] = parseExpenses("a,1");
const e = new ImportError([new LineError(1, "x")]);
const lines: number[] = e.errors.map((x) => x.line);
export { rows, lines };
`);
  assert.ok(r.ok, r.message);
});
test("שורות תקינות", async () => {
  const { parseExpenses } = await get();
  assert.deepEqual(parseExpenses("קפה, 12\n\nספר,59.9\n"), [{ title: "קפה", amount: 12 }, { title: "ספר", amount: 59.9 }]);
  assert.deepEqual(parseExpenses(""), []);
  assert.deepEqual(parseExpenses("  \n\n"), []);
});
test("כל השגיאות, לפי הסדר ועם מספרי שורות", async () => {
  const { parseExpenses, ImportError, LineError } = await get();
  let caught;
  try {
    parseExpenses("קפה,12\nספר\n,5\nמונית,-3\n\nא,ב,ג\nלחם,abc\nחלב,\nתקין,1");
  } catch (err) {
    caught = err;
  }
  assert.ok(caught instanceof ImportError, "צריך לזרוק ImportError");
  assert.equal(caught.name, "ImportError");
  assert.equal(caught.message, "6 שורות לא תקינות");
  assert.ok(caught.errors.every((e) => e instanceof LineError), "כל איבר ב־errors צריך להיות LineError");
  assert.deepEqual(caught.errors.map((e) => [e.line, e.message]), [
    [2, "שורה 2: צריך שני שדות"],
    [3, "שורה 3: כותרת ריקה"],
    [4, "שורה 4: סכום לא תקין"],
    [6, "שורה 6: צריך שני שדות"],
    [7, "שורה 7: סכום לא תקין"],
    [8, "שורה 8: סכום לא תקין"],
  ]);
  assert.equal(caught.errors[0].name, "LineError");
});
test("סכום 0 אינו חיובי", async () => {
  const { parseExpenses, ImportError } = await get();
  assert.throws(() => parseExpenses("a,0"), (e) => e instanceof ImportError && e.errors.length === 1 && e.errors[0].message === "שורה 1: סכום לא תקין");
});
