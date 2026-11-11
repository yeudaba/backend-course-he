import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E68.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseCommand"]);
const err = (message) => ({ kind: "error", message });

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוס Command", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseCommand } from "FILE";
import type { Command } from "FILE";
const c: Command = parseCommand("list");
// @ts-expect-error — ל־add חייבים name ו־amount
const half: Command = { kind: "add", name: "x" };
// @ts-expect-error — ל־list אין שדות נוספים
const extra: Command = { kind: "list", id: 1 };
function use(cmd: Command): string {
  // @ts-expect-error — בלי בדיקת kind אין amount
  const a = cmd.amount;
  switch (cmd.kind) {
    case "add": return cmd.name + cmd.amount.toFixed(2);
    case "remove": return String(cmd.id);
    case "error": return cmd.message;
    case "list": return "list" + a;
  }
}
export { half, extra, use };
`);
  assert.ok(r.ok, r.message);
});
test("פקודות תקינות", async () => {
  const { parseCommand } = await get();
  assert.deepEqual(parseCommand("add קפה 12.5"), { kind: "add", name: "קפה", amount: 12.5 });
  assert.deepEqual(parseCommand("   add   עוגה    3 "), { kind: "add", name: "עוגה", amount: 3 });
  assert.deepEqual(parseCommand("  list "), { kind: "list" });
  assert.deepEqual(parseCommand("remove 7"), { kind: "remove", id: 7 });
});
test("שגיאות — בלי throw", async () => {
  const { parseCommand } = await get();
  const cases = [
    ["add קפה", "שימוש: add <name> <amount>"],
    ["add קפה 1 2", "שימוש: add <name> <amount>"],
    ["add קפה abc", "סכום לא תקין"],
    ["add קפה 0", "סכום לא תקין"],
    ["add קפה -4", "סכום לא תקין"],
    ["list all", "שימוש: list"],
    ["remove", "שימוש: remove <id>"],
    ["remove 1.5", "מזהה לא תקין"],
    ["remove 0", "מזהה לא תקין"],
    ["remove x", "מזהה לא תקין"],
    ["fly", "פקודה לא מוכרת"],
    ["", "פקודה לא מוכרת"],
    ["   ", "פקודה לא מוכרת"],
  ];
  for (const [line, message] of cases) {
    let got;
    try {
      got = parseCommand(line);
    } catch (e) {
      assert.fail(`parseCommand(${JSON.stringify(line)}) זרקה (${e.message}) — החזר { kind: "error", message } במקום`);
    }
    assert.deepEqual(got, err(message), `parseCommand(${JSON.stringify(line)})`);
  }
  assert.ok(!/\bthrow\b/.test(code(import.meta.url, FILE)), "בתרגיל הזה — בלי throw");
});
