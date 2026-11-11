import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E27.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseDuration", "formatDuration"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים: number | null, ומחרוזת", () => {
  const r = typeProbe(
    import.meta.url,
    FILE,
    `import { parseDuration, formatDuration } from "FILE";

const r = parseDuration("1h");
// @ts-expect-error — parseDuration יכולה להחזיר null, ולכן אי אפשר להשתמש בה כמספר בלי בדיקה
const bad: number = r;
// אחרי בדיקת null — זה מספר
if (r !== null) {
  const ok: number = r;
}
// formatDuration מחזירה מחרוזת
const s: string = formatDuration(90);
// @ts-expect-error — formatDuration מקבלת מספר, לא מחרוזת
formatDuration("90");
// @ts-expect-error — parseDuration מקבלת מחרוזת, לא מספר
parseDuration(90);

export { bad, s };
`
  );
  assert.ok(r.ok, r.message);
});
test("parseDuration — טקסט תקין", async () => {
  const { parseDuration } = await get();
  const cases = [["1h 30m", 90], [" 2h ", 120], ["15m 1h", 75], ["45m", 45], ["0m", 0], ["1h   1h   5m", 125]];
  for (const [text, expected] of cases) assert.equal(parseDuration(text), expected, `parseDuration(${JSON.stringify(text)})`);
});
test("parseDuration — טקסט לא תקין ← null", async () => {
  const { parseDuration } = await get();
  for (const text of ["", "   ", "abc", "1.5h", "h", "10", "5x", "1h 30", "-5m", "1h abc"]) {
    assert.equal(parseDuration(text), null, `parseDuration(${JSON.stringify(text)}) צריכה להחזיר null`);
  }
});
test("formatDuration", async () => {
  const { formatDuration } = await get();
  const cases = [[90, "1h 30m"], [120, "2h"], [45, "45m"], [0, "0m"], [61, "1h 1m"], [600, "10h"]];
  for (const [minutes, expected] of cases) assert.equal(formatDuration(minutes), expected, `formatDuration(${minutes})`);
});
