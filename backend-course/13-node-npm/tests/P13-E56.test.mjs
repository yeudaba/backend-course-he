import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E56.mjs", ["formatHelp"])).formatHelp;

test("הדוגמה מהמשימה", async () => {
  const formatHelp = await get();
  const text = formatHelp("expenses", [
    { name: "add", args: "<title> <amount>", desc: "הוספת הוצאה" },
    { name: "list", args: "", desc: "כל ההוצאות" },
  ]);
  assert.equal(text, ["שימוש: expenses <פקודה> [ארגומנטים]", "", "פקודות:", "  add <title> <amount>   הוספת הוצאה", "  list                   כל ההוצאות"].join("\n"));
});
test("היישור לפי הארוך ביותר", async () => {
  const formatHelp = await get();
  const text = formatHelp("t", [
    { name: "a", args: "", desc: "x" },
    { name: "longer-name", args: "<id>", desc: "y" },
  ]);
  assert.equal(text.split("\n").slice(3).join("\n"), ["  a" + " ".repeat(18) + "x", "  longer-name <id>   y"].join("\n"));
});
test("בלי פקודות", async () => {
  const formatHelp = await get();
  assert.equal(formatHelp("x", []), "שימוש: x <פקודה> [ארגומנטים]\n\nפקודות:");
});
