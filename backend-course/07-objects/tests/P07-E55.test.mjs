import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E55.js";
const get = () => exportsOf(import.meta.url, FILE, ["ageGroups"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שלוש קבוצות", async () => {
  const { ageGroups } = await get();
  assert.deepEqual(ageGroups([
    { name: "דנה", age: 31 },
    { name: "עומר", age: 12 },
    { name: "סבתא רחל", age: 70 },
    { name: "נועה", age: 18 },
  ]), { minors: ["עומר"], adults: ["דנה", "נועה"], seniors: ["סבתא רחל"] });
});
test("גבולות: 17, 18, 64, 65", async () => {
  const { ageGroups } = await get();
  assert.deepEqual(ageGroups([
    { name: "a", age: 17 },
    { name: "b", age: 18 },
    { name: "c", age: 64 },
    { name: "d", age: 65 },
  ]), { minors: ["a"], adults: ["b", "c"], seniors: ["d"] });
});
test("ריק — שלוש קבוצות ריקות, ובכל קריאה אובייקט חדש", async () => {
  const { ageGroups } = await get();
  assert.deepEqual(ageGroups([]), { minors: [], adults: [], seniors: [] });
  ageGroups([{ name: "x", age: 5 }]);
  assert.deepEqual(ageGroups([]).minors, [], "הקבוצות צריכות להיווצר מחדש בכל קריאה");
});
