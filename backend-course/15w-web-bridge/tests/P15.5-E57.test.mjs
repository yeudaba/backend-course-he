import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { fakeDocument, fire } from "./_html.mjs";

const HTML = '<button id="dec">−</button><output id="count">0</output><button id="inc">+</button>';
async function setup(opts) {
  const { bindCounter } = await exportsOf(import.meta.url, "P15.5-E57.mjs", ["bindCounter"]);
  const doc = fakeDocument(HTML);
  const getValue = opts ? bindCounter(doc, opts) : bindCounter(doc);
  const $ = (s) => doc.querySelector(s);
  return { getValue, inc: $("#inc"), dec: $("#dec"), out: $("#count") };
}
test("מצב התחלתי", async () => {
  const { getValue, inc, dec, out } = await setup();
  assert.equal(typeof getValue, "function", "מחזירה פונקציה getValue");
  assert.equal(getValue(), 0);
  assert.equal(out.textContent, "0");
  assert.equal(dec.disabled, true, "#dec נעול ב־0 כבר בהתחלה");
  assert.equal(inc.disabled, false);
});
test("לחיצות", async () => {
  const { getValue, inc, dec, out } = await setup();
  await fire(inc, "click");
  await fire(inc, "click");
  await fire(inc, "click");
  assert.equal(out.textContent, "3");
  assert.equal(dec.disabled, false);
  await fire(dec, "click");
  assert.equal(getValue(), 2);
  assert.equal(out.textContent, "2");
});
test("max", async () => {
  const { getValue, inc, out } = await setup({ max: 2 });
  await fire(inc, "click");
  await fire(inc, "click");
  assert.equal(inc.disabled, true, "#inc נעול ב־max");
  await fire(inc, "click");
  assert.equal(getValue(), 2, "גם אם 'לוחצים' על כפתור נעול — לא עוברים את max");
  assert.equal(out.textContent, "2");
  const d = await setup();
  for (let i = 0; i < 12; i++) await fire(d.inc, "click");
  assert.equal(d.getValue(), 10, "ברירת מחדל max = 10");
});
test("לא יורדים מתחת ל־0, ושני מונים נפרדים", async () => {
  const a = await setup();
  const b = await setup();
  await fire(a.dec, "click");
  assert.equal(a.getValue(), 0);
  await fire(a.inc, "click");
  assert.equal(b.getValue(), 0);
});
