import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E43.js", ["timerOrder"]);

test("הדוגמה מהמשימה", async () => {
  const { timerOrder } = await get();
  const timers = [{ label: "A", ms: 100 }, { label: "B", ms: 0 }, { label: "C", ms: 50 }, { label: "D", ms: 0 }];
  assert.deepEqual(timerOrder(timers), ["B", "D", "C", "A"]);
  assert.deepEqual(timers.map((t) => t.label), ["A", "B", "C", "D"], "המערך המקורי השתנה — העתק לפני sort");
});
test("שוויון שומר על סדר הרישום, ומספרים דו־ספרתיים", async () => {
  const { timerOrder } = await get();
  assert.deepEqual(
    timerOrder([{ label: "x", ms: 10 }, { label: "y", ms: 9 }, { label: "z", ms: 10 }, { label: "w", ms: 100 }, { label: "v", ms: 9 }]),
    ["y", "v", "x", "z", "w"],
  );
});
test("ריק ויחיד", async () => {
  const { timerOrder } = await get();
  assert.deepEqual(timerOrder([]), []);
  assert.deepEqual(timerOrder([{ label: "רק", ms: 5 }]), ["רק"]);
});
