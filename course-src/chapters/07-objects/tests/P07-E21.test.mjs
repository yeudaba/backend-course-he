import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { applySale } = await load(import.meta.url, "P07-E21.js");

test("מחזיר עותק במבצע", () => assert.deepEqual(applySale({ name: "מקלדת", price: 200, history: [220] }, 10), { name: "מקלדת", price: 180, history: [220, 200] }));
test("המקור לא משתנה — גם לא ההיסטוריה", () => {
  const kb = { name: "מקלדת", price: 200, history: [220] };
  applySale(kb, 10);
  assert.deepEqual(kb, { name: "מקלדת", price: 200, history: [220] });
});
