import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E77.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseConfig"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (unknown) => Config", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseConfig } from "FILE";
import type { Config } from "FILE";
const raw: unknown = JSON.parse("{}");
const c: Config = parseConfig(raw);
const p: number = c.port;
const d: boolean = c.debug;
// @ts-expect-error — debug ב־Config הוא חובה (בוליאני), אחרי ברירת המחדל
const noDebug: Config = { host: "h", port: 1 };
export { p, d, noDebug };
`);
  assert.ok(r.ok, r.message);
});
test("תקינים", async () => {
  const { parseConfig } = await get();
  assert.deepEqual(parseConfig({ host: "localhost", port: 3000 }), { host: "localhost", port: 3000, debug: false });
  assert.deepEqual(parseConfig({ host: "db", port: 1, debug: true, extra: "x" }), { host: "db", port: 1, debug: true }, "בלי שדות נוספים");
  assert.deepEqual(parseConfig({ host: "a", port: 65535, debug: false }), { host: "a", port: 65535, debug: false });
});
test("הודעה מדויקת לכל שדה", async () => {
  const { parseConfig } = await get();
  const cases = [
    [null, "ההגדרות חייבות להיות אובייקט"],
    [[], "ההגדרות חייבות להיות אובייקט"],
    ["host=x", "ההגדרות חייבות להיות אובייקט"],
    [{ port: 80 }, "host לא תקין"],
    [{ host: "  ", port: 80 }, "host לא תקין"],
    [{ host: 5, port: 80 }, "host לא תקין"],
    [{ host: "x" }, "port לא תקין"],
    [{ host: "x", port: "3000" }, "port לא תקין"],
    [{ host: "x", port: 0 }, "port לא תקין"],
    [{ host: "x", port: 65536 }, "port לא תקין"],
    [{ host: "x", port: 80.5 }, "port לא תקין"],
    [{ host: "x", port: NaN }, "port לא תקין"],
    [{ host: "x", port: 80, debug: "yes" }, "debug לא תקין"],
    [{ host: "x", port: 80, debug: null }, "debug לא תקין"],
  ];
  for (const [raw, message] of cases) assert.throws(() => parseConfig(raw), { message }, `parseConfig(${JSON.stringify(raw)})`);
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as — narrowing בלבד");
});
