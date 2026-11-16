import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { runMutants } = await load(import.meta.url, "P30-E104.ts");
const correct = (t, s) => Math.ceil(t / s);
const mutants = [
  { name: "floor", impl: (t, s) => Math.floor(t / s) },
  { name: "floor+1", impl: (t, s) => Math.floor(t / s) + 1 },
  { name: "round", impl: (t, s) => Math.round(t / s) },
  { name: "same", impl: (t, s) => Math.ceil(t / s) },
];

test("בדיקות חלשות — מוטנטים שורדים", async () => {
  const weak = (f) => assert.equal(f(100, 20), 5);
  assert.deepEqual(await runMutants(weak, correct, mutants), { passesOnCorrect: true, killed: ["floor+1"], survived: ["floor", "round", "same"] });
});
test("בדיקות חזקות, async", async () => {
  const strong = async (f) => {
    await new Promise((r) => setTimeout(r, 1));
    assert.equal(f(100, 20), 5);
    assert.equal(f(101, 20), 6);
    assert.equal(f(5, 20), 1);
  };
  assert.deepEqual(await runMutants(strong, correct, mutants), { passesOnCorrect: true, killed: ["floor", "floor+1", "round"], survived: ["same"] });
});
test("נכשל על הקוד התקין ← בלי להריץ מוטנטים", async () => {
  let runs = 0;
  const wrong = (f) => { runs++; assert.equal(f(101, 20), 5); };
  assert.deepEqual(await runMutants(wrong, correct, mutants), { passesOnCorrect: false, killed: [], survived: [] });
  assert.equal(runs, 1);
});
