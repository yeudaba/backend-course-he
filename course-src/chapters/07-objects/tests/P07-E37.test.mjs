import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E37.js";
const get = () => exportsOf(import.meta.url, FILE, ["statusText"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("קודים מוכרים", async () => {
  const { statusText } = await get();
  assert.equal(statusText(200), "OK");
  assert.equal(statusText(201), "Created");
  assert.equal(statusText(400), "Bad Request");
  assert.equal(statusText(404), "Not Found");
  assert.equal(statusText(500), "Internal Server Error");
});
test("קוד כמחרוזת", async () => {
  const { statusText } = await get();
  assert.equal(statusText("404"), "Not Found");
  assert.equal(statusText("200"), "OK");
});
test("קוד לא מוכר", async () => {
  const { statusText } = await get();
  assert.equal(statusText(418), "Unknown");
  assert.equal(statusText(302), "Unknown");
});
test("בלי switch ובלי if", () => {
  assert.doesNotMatch(src(), /\bswitch\s*\(|\bif\s*\(/, "התרגיל מבקש מילון (אובייקט) במקום switch או if");
});
