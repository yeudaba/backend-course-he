import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E44.ts";
const get = () => exportsOf(import.meta.url, FILE, ["receipt"]);
const line = (l, n) => l.padEnd(12) + n.toFixed(2).padStart(8);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: (string[], number[]) => string", () => {
  const r = typeProbe(import.meta.url, FILE, `import { receipt } from "FILE";
const s: string = receipt(["a"], [1]);
// @ts-expect-error — המחירים הם מספרים
receipt(["a"], ["1"]);
// @ts-expect-error — מחזירה string
const n: number = receipt([], []);
export { s, n };
`);
  assert.ok(r.ok, r.message);
});
test("הדוגמה מהמשימה", async () => {
  const { receipt } = await get();
  assert.equal(receipt(["קפה", "עוגה"], [12, 18.5]), [line("קפה", 12), line("עוגה", 18.5), line("סה״כ", 30.5)].join("\n"));
});
test("סכום מדויק בלי עיגול באמצע, ורשימה ריקה", async () => {
  const { receipt } = await get();
  assert.equal(receipt(["a", "b", "c"], [0.005, 0.005, 1]), [line("a", 0.005), line("b", 0.005), line("c", 1), line("סה״כ", 1.01)].join("\n"));
  assert.equal(receipt([], []), line("סה״כ", 0));
});
test("אורכים שונים ← שגיאה", async () => {
  const { receipt } = await get();
  assert.throws(() => receipt(["a", "b"], [1]), { message: "names ו־prices באורך שונה" });
});
