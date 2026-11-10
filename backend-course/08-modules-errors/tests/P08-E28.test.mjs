import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P08-E28.js", ["parseCommand"]);
const throwsMsg = (fn, message, label) =>
  assert.throws(fn, (err) => err instanceof Error && err.message === message, `${label} — ציפינו לשגיאה עם ההודעה: ${message}`);

test("add עם הערה", async () => {
  const { parseCommand } = await get();
  assert.deepEqual(parseCommand("add 25 קפה בבוקר"), { cmd: "add", amount: 25, note: "קפה בבוקר" });
});
test("add בלי הערה, עם שבר", async () => {
  const { parseCommand } = await get();
  assert.deepEqual(parseCommand("add 12.5"), { cmd: "add", amount: 12.5, note: "" });
});
test("רווחים מיותרים ואותיות גדולות", async () => {
  const { parseCommand } = await get();
  assert.deepEqual(parseCommand("   ADD   7   חלב  3% "), { cmd: "add", amount: 7, note: "חלב 3%" });
  assert.deepEqual(parseCommand(" LIST "), { cmd: "list" });
  assert.deepEqual(parseCommand("total"), { cmd: "total" });
});
test("סכום לא תקין", async () => {
  const { parseCommand } = await get();
  for (const line of ["add", "add abc", "add 0", "add -5", "add 25abc"]) {
    throwsMsg(() => parseCommand(line), "סכום לא תקין", `"${line}"`);
  }
});
test("שורה ריקה ופקודה לא מוכרת", async () => {
  const { parseCommand } = await get();
  throwsMsg(() => parseCommand(""), "לא הוקלדה פקודה", "שורה ריקה");
  throwsMsg(() => parseCommand("   "), "לא הוקלדה פקודה", "שורה עם רווחים בלבד");
  throwsMsg(() => parseCommand("delete 3"), 'פקודה לא מוכרת: "delete"', '"delete 3"');
});
test("switch", () => {
  assert.match(code(import.meta.url, "P08-E28.js"), /switch\s*\(/, "התרגיל מתרגל switch (פרק 3)");
});
