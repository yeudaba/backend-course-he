import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { fakeDocument, usedInnerHTML } from "./_html.mjs";

async function setup() {
  const mod = await exportsOf(import.meta.url, "P15.5-E71.mjs", ["showError", "clearError"]);
  const doc = fakeDocument('<div id="error" class="message error" hidden><p>ישן</p></div>');
  return { ...mod, doc, box: doc.querySelector("#error") };
}
test("שגיאה עם details", async () => {
  const { showError, doc, box } = await setup();
  assert.equal(box.hidden, true);
  showError(doc, box, { code: "VALIDATION_ERROR", message: "קלט לא תקין", details: [{ path: "body.title", message: "חובה" }, { path: "body.dueDate", message: "<b>תאריך</b>" }] });
  assert.equal(box.hidden, false);
  const kids = box.elementChildren;
  assert.deepEqual(kids.map((k) => k.tag), ["p", "ul"], "p ואחריו ul — והתוכן הישן נמחק");
  assert.equal(kids[0].textContent, "קלט לא תקין");
  assert.deepEqual(kids[1].querySelectorAll("li").map((li) => li.textContent), ["body.title: חובה", "body.dueDate: <b>תאריך</b>"]);
  assert.equal(usedInnerHTML(doc), false, "בלי innerHTML");
});
test("בלי details, או details ריק", async () => {
  const { showError, doc, box } = await setup();
  showError(doc, box, { code: "NOT_FOUND", message: "לא נמצא" });
  assert.deepEqual(box.elementChildren.map((k) => k.tag), ["p"]);
  showError(doc, box, { code: "X", message: "שוב", details: [] });
  assert.deepEqual(box.elementChildren.map((k) => k.tag), ["p"], "details ריק — בלי ul");
  assert.equal(box.textContent, "שוב");
});
test("clearError", async () => {
  const { showError, clearError, doc, box } = await setup();
  showError(doc, box, { message: "x" });
  clearError(box);
  assert.equal(box.hidden, true);
  assert.equal(box.textContent, "");
  assert.equal(box.elementChildren.length, 0);
});
