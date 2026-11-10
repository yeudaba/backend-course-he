import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P07-E28.js", ["balanceOf"]);

test("הדוגמה מהמשימה — 65", async () => {
  const { balanceOf } = await get();
  assert.equal(
    balanceOf([
      { type: "deposit", amount: 100 },
      { type: "withdraw", amount: 30 },
      { type: "withdraw", amount: 500 },
      { type: "fee" },
      { type: "bonus", amount: 1000 },
    ]),
    65
  );
});
test("אין אירועים — 0", async () => {
  const { balanceOf } = await get();
  assert.equal(balanceOf([]), 0, "שכחת את הערך ההתחלתי 0 ב־reduce?");
});
test("משיכה של כל היתרה מותרת", async () => {
  const { balanceOf } = await get();
  assert.equal(balanceOf([{ type: "deposit", amount: 40 }, { type: "withdraw", amount: 40 }]), 0);
});
test("עמלה יכולה להוריד מתחת ל־0", async () => {
  const { balanceOf } = await get();
  assert.equal(balanceOf([{ type: "fee" }, { type: "fee" }]), -10);
});
test("אירוע לא מוכר באמצע לא מקלקל את מה שאחריו", async () => {
  const { balanceOf } = await get();
  assert.equal(balanceOf([{ type: "deposit", amount: 10 }, { type: "refund", amount: 3 }, { type: "deposit", amount: 5 }]), 15, "חסר default שמחזיר את היתרה?");
});
test("reduce ו־switch", () => {
  const src = code(import.meta.url, "P07-E28.js");
  assert.match(src, /\.reduce\s*\(/, "התרגיל מתרגל reduce (פרק 6)");
  assert.match(src, /switch\s*\(/, "התרגיל מתרגל switch (פרק 3)");
});
