import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E72.ts", ["createSpy"])).createSpy;

test("רושם קריאות ותוצאות", async () => {
  const createSpy = await get();
  const add = createSpy((a, b) => a + b);
  assert.equal(typeof add, "function");
  assert.equal(add(2, 3), 5);
  assert.equal(add(10, -1), 9);
  assert.deepEqual(add.calls, [[2, 3], [10, -1]]);
  assert.deepEqual(add.results, [5, 9]);
  assert.equal(add.callCount, 2);
  const empty = createSpy();
  assert.equal(empty("x"), undefined);
  assert.deepEqual(empty.calls, [["x"]]);
});
test("mockReturnValueOnce — תור לפי הסדר, ושרשור", async () => {
  const createSpy = await get();
  const s = createSpy(() => "רגיל");
  assert.equal(s.mockReturnValueOnce("א").mockReturnValueOnce("ב"), s, "מחזיר את ה־spy");
  assert.deepEqual([s(), s(), s(), s()], ["א", "ב", "רגיל", "רגיל"]);
  const u = createSpy();
  u.mockReturnValueOnce(0).mockReturnValueOnce(null);
  assert.deepEqual([u(), u(), u()], [0, null, undefined], "0 ו־null הם ערכים בתור");
});
test("mockImplementation ו־reset", async () => {
  const createSpy = await get();
  const s = createSpy(() => 1);
  assert.equal(s.mockImplementation((x) => x * 2), s);
  assert.equal(s(21), 42);
  s.mockReturnValueOnce("once");
  s.reset();
  assert.deepEqual([s.calls, s.results, s.callCount], [[], [], 0]);
  assert.equal(s(5), 10, "reset ניקה את התור, אבל לא את ה־implementation");
});
test("implementation שזורק", async () => {
  const createSpy = await get();
  const s = createSpy(() => { throw new Error("בום"); });
  assert.throws(() => s(1, 2), { message: "בום" });
  assert.deepEqual(s.calls, [[1, 2]], "הקריאה נרשמה");
  assert.equal(s.callCount, 1);
});
