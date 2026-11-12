import { test } from "node:test";
import assert from "node:assert/strict";
import { expect as real } from "expect";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E69.ts", ["expect"])).expect;
const passes = (fn) => { try { fn(); return true; } catch { return false; } };
const show = (v) => (typeof v === "function" ? "fn" : JSON.stringify(v, (k, x) => (x === undefined ? "undefined" : Number.isNaN(x) ? "NaN" : x)));

const VALUES = [
  [1, 1], [1, "1"], [NaN, NaN], [0, -0], [null, undefined], ["a", "a"],
  [{ a: 1 }, { a: 1 }], [{ a: 1 }, { a: 2 }], [{ a: 1, b: undefined }, { a: 1 }], [{ a: 1 }, { a: 1, b: undefined }],
  [{ a: 1, b: 2 }, { a: 1 }], [{ a: 1 }, { a: 1, b: 2 }], [[1, 2], [1, 2]], [[1, 2], [2, 1]], [[1, 2, 3], [1, 2]], [[1, 2], [1, 2, 3]],
  [{ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 2 }] } }], [{ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 3 }] } }],
  [{ a: { b: 1, x: 9 } }, { a: { b: 1 } }], [[{ a: 1, x: 2 }], [{ a: 1 }]], [null, {}], [{}, null],
  [{ id: 1, title: "חלב", ownerId: 7 }, { title: "חלב" }], [{ d: new Date("2026-11-05T00:00:00Z") }, { d: new Date("2026-11-05T00:00:00Z") }],
  [{ d: new Date("2026-11-05T00:00:00Z") }, { d: new Date("2026-11-06T00:00:00Z") }], [[], []], [{}, {}],
];

test("toBe, toEqual, toMatchObject — כמו Jest", async () => {
  const expect = await get();
  for (const [a, b] of VALUES) {
    for (const m of ["toBe", "toEqual", "toMatchObject"]) {
      if (m === "toMatchObject" && (typeof a !== "object" || a === null || typeof b !== "object" || b === null)) continue;
      const want = passes(() => real(a)[m](b));
      const got = passes(() => expect(a)[m](b));
      assert.equal(got, want, `expect(${show(a)}).${m}(${show(b)}) — ב־Jest ${want ? "עובר" : "נכשל"}`);
    }
  }
});
test("toThrow — כמו Jest", async () => {
  const expect = await get();
  const thrower = (e) => () => { throw e; };
  const cases = [
    [thrower(new RangeError("page חייב להיות חיובי")), undefined],
    [thrower(new RangeError("page חייב להיות חיובי")), "חיובי"],
    [thrower(new RangeError("page חייב להיות חיובי")), "שלילי"],
    [thrower(new RangeError("page חייב להיות חיובי")), /^page/],
    [thrower(new RangeError("page חייב להיות חיובי")), /^חיובי/],
    [thrower(new RangeError("x")), RangeError],
    [thrower(new RangeError("x")), Error],
    [thrower(new Error("x")), RangeError],
    [thrower(new TypeError("x")), TypeError],
    [() => 5, undefined],
    [() => 5, "x"],
    [() => 5, Error],
  ];
  for (const [fn, exp] of cases) {
    const want = passes(() => (exp === undefined ? real(fn).toThrow() : real(fn).toThrow(exp)));
    const got = passes(() => (exp === undefined ? expect(fn).toThrow() : expect(fn).toThrow(exp)));
    assert.equal(got, want, `toThrow(${exp === undefined ? "" : exp.name ?? String(exp)}) על ${fn.toString().slice(0, 50)} — ב־Jest ${want ? "עובר" : "נכשל"}`);
  }
});
test("כשל ← Error", async () => {
  const expect = await get();
  assert.throws(() => expect(1).toBe(2), Error);
  assert.doesNotThrow(() => expect({ a: [1] }).toEqual({ a: [1] }));
});
