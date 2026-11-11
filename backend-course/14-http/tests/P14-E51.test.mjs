import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E51.mjs", ["chooseFormat"])).chooseFormat;
const both = ["application/json", "text/html"];

test("q גבוה מנצח", async () => {
  const f = await get();
  assert.equal(f("text/html, application/json;q=0.9, */*;q=0.1", both), "text/html");
  assert.equal(f("text/html;q=0.4, application/json;q=0.9", both), "application/json");
  assert.equal(f("application/json", both), "application/json");
  assert.equal(f("text/*;q=0.5, */*;q=0.2", both), "text/html", "text/* מתאים ל־text/html");
});
test("שוויון ← לפי סדר השרת", async () => {
  const f = await get();
  assert.equal(f("*/*", both), "application/json");
  assert.equal(f("*/*", ["text/html", "application/json"]), "text/html");
  assert.equal(f("application/json, text/html", ["text/html", "application/json"]), "text/html");
});
test("ספציפי גובר על כללי, q=0 פוסל", async () => {
  const f = await get();
  assert.equal(f("*/*, application/json;q=0", both), "text/html", "application/json;q=0 גובר על */*");
  assert.equal(f("text/*;q=0, */*;q=0.3", both), "application/json");
  assert.equal(f("text/html;q=0.2, text/*;q=0.9", both), "text/html", "התאמה מדויקת גוברת, גם עם q נמוך יותר — ועדיין מעל 0");
  assert.equal(f("text/html;q=0.2, text/*;q=0.9, application/json;q=0.1", both), "text/html");
});
test("אין התאמה, accept ריק, אותיות ורווחים", async () => {
  const f = await get();
  assert.equal(f("image/png", both), null);
  assert.equal(f("application/json;q=0", ["application/json"]), null);
  assert.equal(f(undefined, both), "application/json");
  assert.equal(f("", ["text/html", "application/json"]), "text/html");
  assert.equal(f(" Text/HTML ; q=0.8 ,  application/JSON ; q=0.5 ", both), "text/html");
});
