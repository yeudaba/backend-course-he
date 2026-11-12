import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E71.ts", ["runMutants"])).runMutants;
const SRC = "export const isAdult = (age) => age >= 18;\nexport const price = (n) => n * 100;\n";
// "הבדיקות": מריצות את הקוד ובודקות שני דברים
function tests(code) {
  const isAdult = (age) => new Function("age", "return " + code.match(/isAdult = \(age\) => (.*);/)[1])(age);
  const price = (n) => new Function("n", "return " + code.match(/price = \(n\) => (.*);/)[1])(n);
  return isAdult(18) === true && isAdult(17) === false && price(2) === 200;
}

test("נהרגים ושורדים", async () => {
  const runMutants = await get();
  const seen = [];
  const r = await runMutants(SRC, [
    { desc: ">= ← >", replace: [["age >= 18", "age > 18"]] },
    { desc: "18 ← 17", replace: [["18", "17"]] },
    { desc: "שורד: 100 ← 100.0", replace: [["n * 100", "n * 100.0"]] },
    { desc: "שתי החלפות", replace: [["age >= 18", "age >= 0"], ["n * 100", "n * 10"]] },
  ], (code) => { seen.push(code); return tests(code); });
  assert.deepEqual(r, { killed: [">= ← >", "18 ← 17", "שתי החלפות"], survived: ["שורד: 100 ← 100.0"], score: 75 });
  assert.equal(seen[0], SRC, "קודם מריצים על המקור");
  assert.equal(seen.length, 5);
  assert.ok(seen[4].includes("age >= 0") && seen[4].includes("n * 10;"), "שתי ההחלפות הוחלו");
});
test("מופע ראשון בלבד, לפי הסדר, ו־$ כמו שהוא", async () => {
  const runMutants = await get();
  const codes = [];
  await runMutants("a a a", [
    { desc: "ראשון", replace: [["a", "b"]] },
    { desc: "סדר", replace: [["a", "b"], ["a", "c"]] },
    { desc: "דולר", replace: [["a", "$&$&"]] },
  ], (code) => { codes.push(code); return code === "a a a"; });
  assert.deepEqual(codes.slice(1), ["b a a", "b c a", "$&$& a a"]);
});
test("מקור שנכשל, החלפה שלא נמצאה, אסינכרוני, ריק", async () => {
  const runMutants = await get();
  await assert.rejects(runMutants("x", [{ desc: "d", replace: [["x", "y"]] }], () => false), { message: "הבדיקות נכשלות על הקוד התקין" });
  await assert.rejects(runMutants("abc", [{ desc: "חסר", replace: [["zzz", "y"]] }], () => true), { message: '"zzz" לא נמצא (חסר)' });
  const r = await runMutants("abc", [{ desc: "m1", replace: [["a", "A"]] }, { desc: "m2", replace: [["b", "B"]] }, { desc: "m3", replace: [["c", "C"]] }], async (code) => {
    await new Promise((res) => setTimeout(res, 2));
    return code !== "Abc";
  });
  assert.deepEqual(r, { killed: ["m1"], survived: ["m2", "m3"], score: 33 }, "runTests אסינכרוני; score מעוגל");
  assert.deepEqual(await runMutants("abc", [], () => true), { killed: [], survived: [], score: 100 });
});
