import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P05-E33.js", ["rectangleArea"]);

test("4 על 2.5", async () => {
  const { rectangleArea } = await get();
  assert.equal(rectangleArea(4, 2.5), 10);
});
test("ערכים אחרים — הפונקציה מחשבת מהפרמטרים", async () => {
  const { rectangleArea } = await get();
  assert.equal(rectangleArea(3, 7), 21, "rectangleArea(3, 7)");
  assert.equal(rectangleArea(0, 5), 0, "rectangleArea(0, 5)");
  assert.equal(rectangleArea(1.5, 1.5), 2.25, "rectangleArea(1.5, 1.5)");
  assert.equal(rectangleArea(2, 3), 6, "רוחב כפול גובה — לא חיבור");
});
