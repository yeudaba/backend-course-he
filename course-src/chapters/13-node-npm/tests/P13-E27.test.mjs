import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P13-E27.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["bump"])).bump;

test("patch, ‏minor, ‏major", async () => {
  const bump = await get();
  assert.equal(bump("1.4.2", "patch"), "1.4.3");
  assert.equal(bump("1.4.2", "minor"), "1.5.0", "ב־minor ה־patch מתאפס");
  assert.equal(bump("1.4.2", "major"), "2.0.0", "ב־major גם minor וגם patch מתאפסים");
});
test("מספרים ולא טקסט", async () => {
  const bump = await get();
  assert.equal(bump("0.9.9", "minor"), "0.10.0", "9 + 1 = 10 (map(Number)?)");
  assert.equal(bump("9.0.19", "patch"), "9.0.20");
  assert.equal(bump("10.20.30", "major"), "11.0.0");
});
test("גרסה לא תקינה", async () => {
  const bump = await get();
  for (const v of ["1.4", "1.4.x", "v1.4.2", "1.4.2.0", "1x4x2", "", "1.4.2-beta"]) {
    assert.throws(() => bump(v, "patch"), { message: `גרסה לא תקינה: ${v}` }, `bump(${JSON.stringify(v)}, "patch")`);
  }
});
test("סוג לא מוכר", async () => {
  const bump = await get();
  assert.throws(() => bump("1.0.0", "huge"), { message: "סוג לא מוכר: huge" });
  assert.throws(() => bump("1.0.0", "Patch"), { message: "סוג לא מוכר: Patch" });
});
test("כתוב עם switch", () => {
  assert.match(code(import.meta.url, FILE), /\bswitch\s*\(/, "התרגיל מתרגל switch (פרק 4)");
});
