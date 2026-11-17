import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { fakeDocument, usedInnerHTML } from "./_html.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E56.mjs", ["renderTasks"])).renderTasks;
test("משימות", async () => {
  const renderTasks = await get();
  const doc = fakeDocument('<ul id="tasks"><li>ישן</li></ul>');
  const ul = doc.querySelector("#tasks");
  renderTasks(doc, ul, [{ id: 7, title: "<b>חלב</b>", done: false }, { id: 8, title: "לחם", done: true }]);
  const items = ul.querySelectorAll("li");
  assert.equal(items.length, 2, "הפריט הישן נמחק — replaceChildren");
  assert.deepEqual(items.map((li) => li.textContent), ["<b>חלב</b>", "לחם"], "הכותרת כטקסט");
  assert.deepEqual(items.map((li) => li.dataset.id), ["7", "8"], "data-id");
  assert.deepEqual(items.map((li) => li.classList.contains("done")), [false, true], "class done רק למשימה שבוצעה");
  assert.equal(usedInnerHTML(doc), false, "בלי innerHTML");
});
test("קריאה שנייה — בלי כפילויות", async () => {
  const renderTasks = await get();
  const doc = fakeDocument('<ul id="tasks"></ul>');
  const ul = doc.querySelector("#tasks");
  const tasks = [{ id: 1, title: "א", done: false }];
  renderTasks(doc, ul, tasks);
  renderTasks(doc, ul, tasks);
  renderTasks(doc, ul, [...tasks, { id: 2, title: "ב", done: true }]);
  assert.equal(ul.querySelectorAll("li").length, 2);
});
test("רשימה ריקה", async () => {
  const renderTasks = await get();
  const doc = fakeDocument('<ul id="tasks"><li>x</li><li>y</li></ul>');
  const ul = doc.querySelector("#tasks");
  renderTasks(doc, ul, []);
  const items = ul.querySelectorAll("li");
  assert.equal(items.length, 1);
  assert.ok(items[0].classList.contains("empty"), "class empty");
  assert.equal(items[0].textContent, "אין משימות");
});
