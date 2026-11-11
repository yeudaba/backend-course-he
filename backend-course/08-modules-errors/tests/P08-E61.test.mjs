import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E61.js";
const get = () => exportsOf(import.meta.url, FILE, ["runningBalance"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("יתרה רצה", async () => {
  const { runningBalance } = await get();
  assert.deepEqual(runningBalance(100, [
    { type: "in", amount: 50 },
    { type: "out", amount: "30" },
    { type: "out", amount: 5 },
  ]), [150, 120, 115]);
  assert.deepEqual(runningBalance(0, []), []);
});
test("in כמחרוזת — חיבור מספרי", async () => {
  const { runningBalance } = await get();
  assert.deepEqual(runningBalance(100, [{ type: "in", amount: "50" }]), [150], "\"50\" צריך להפוך למספר לפני החיבור");
  assert.deepEqual(runningBalance(10, [{ type: "out", amount: "4" }, { type: "in", amount: "1.5" }]), [6, 7.5]);
});
test("הקלט לא משתנה", async () => {
  const { runningBalance } = await get();
  const txs = [{ type: "out", amount: 5 }];
  runningBalance(10, txs);
  assert.deepEqual(txs, [{ type: "out", amount: 5 }], "ה־type של הפעולה השתנה — חפש = במקום ===");
});
