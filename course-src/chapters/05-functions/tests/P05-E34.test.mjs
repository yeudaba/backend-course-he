import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E34.js";
const get = () => exportsOf(import.meta.url, FILE, ["fullName"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("דנה לוי", async () => {
  const { fullName } = await get();
  assert.equal(fullName("דנה", "לוי"), "דנה לוי");
});
test("רווחים מיותרים", async () => {
  const { fullName } = await get();
  assert.equal(fullName("  Yossi ", "Cohen "), "Yossi Cohen");
  assert.equal(fullName("a ", " b"), "a b", "הרווחים באמצע צריכים להיעלם — trim על כל חלק בנפרד");
});
