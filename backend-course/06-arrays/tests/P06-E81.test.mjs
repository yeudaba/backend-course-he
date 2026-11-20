import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { serveNext, lastInLine, addVip } = await load(import.meta.url, "P06-E81.js");

test("serveNext מוציאה את הראשון", () => {
  const q = ["א", "ב", "ג"];
  assert.equal(serveNext(q), "א", "הלקוח הראשון בתור צריך לקבל שירות");
  assert.deepEqual(q, ["ב", "ג"], "הראשון צריך לצאת מהתור, והשאר נשארים בסדר");
  assert.equal(serveNext(["רק אחד"]), "רק אחד");
  assert.equal(serveNext([]), null);
});
test("lastInLine מחזירה את האחרון ולא משנה את התור", () => {
  const q = ["א", "ב", "ג", "ד"];
  assert.equal(lastInLine(q), "ד");
  assert.deepEqual(q, ["א", "ב", "ג", "ד"], "lastInLine שינתה את התור");
  assert.equal(lastInLine(["x"]), "x");
  assert.equal(lastInLine([]), null);
});
test("addVip מוסיפה לפני כולם ומחזירה את האורך החדש", () => {
  const q = ["א", "ב"];
  assert.equal(addVip(q, "VIP"), 3, "האורך החדש אחרי ההוספה");
  assert.deepEqual(q, ["VIP", "א", "ב"], "אף אחד לא אמור להיעלם מהתור");
  const empty = [];
  assert.equal(addVip(empty, "ראשון"), 1);
  assert.deepEqual(empty, ["ראשון"]);
});
