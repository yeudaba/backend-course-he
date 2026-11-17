import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E36.js";
const get = () => exportsOf(import.meta.url, FILE, ["nextOnDuty"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מחזירה את הראשון ומעבירה אותו לסוף", async () => {
  const { nextOnDuty } = await get();
  const rota = ["דנה", "עומר", "נועה"];
  assert.equal(nextOnDuty(rota), "דנה");
  assert.deepEqual(rota, ["עומר", "נועה", "דנה"]);
  assert.equal(nextOnDuty(rota), "עומר");
  assert.equal(nextOnDuty(rota), "נועה");
  assert.deepEqual(rota, ["דנה", "עומר", "נועה"], "אחרי סבב מלא — חוזרים לסדר המקורי");
});
test("אדם אחד ברשימה", async () => {
  const { nextOnDuty } = await get();
  const rota = ["יוסי"];
  assert.equal(nextOnDuty(rota), "יוסי");
  assert.deepEqual(rota, ["יוסי"]);
});
test("רשימה ריקה ← null, ובלי להכניס undefined", async () => {
  const { nextOnDuty } = await get();
  const rota = [];
  assert.equal(nextOnDuty(rota), null);
  assert.deepEqual(rota, [], "הרשימה צריכה להישאר ריקה");
});
