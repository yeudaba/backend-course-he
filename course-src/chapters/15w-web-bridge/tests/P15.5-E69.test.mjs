import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { fakeDocument, fire, usedInnerHTML } from "./_html.mjs";

async function render(task) {
  const { renderTask } = await exportsOf(import.meta.url, "P15.5-E69.mjs", ["renderTask"]);
  const doc = fakeDocument("<ul></ul>");
  const calls = [];
  const li = renderTask(doc, task, { onToggle: (...a) => calls.push(["toggle", ...a]), onDelete: (...a) => calls.push(["delete", ...a]) });
  doc.querySelector("ul").append(li);
  return { li, calls, doc };
}
const isCheckbox = (el) => el?.tag === "input" && (el.type === "checkbox" || el.getAttribute("type") === "checkbox");

test("מבנה", async () => {
  const { li, doc } = await render({ id: 7, title: "<b>חלב</b>", status: "todo", priority: "high", dueDate: "2026-11-20" });
  assert.equal(li?.tag, "li", "מחזירה li");
  assert.ok(li.classList.contains("row") && !li.classList.contains("done"));
  assert.equal(li.dataset.id, "7");
  const kids = li.elementChildren;
  assert.equal(kids.length, 4, "4 ילדים: checkbox, span.title, span.meta, button");
  assert.ok(isCheckbox(kids[0]), "ראשון: input type=checkbox");
  assert.equal(kids[0].checked, false);
  assert.ok(kids[1].tag === "span" && kids[1].classList.contains("title"));
  assert.equal(kids[1].textContent, "<b>חלב</b>");
  assert.ok(kids[2].tag === "span" && kids[2].classList.contains("meta"));
  assert.equal(kids[2].textContent, "high · 20.11.2026");
  assert.ok(kids[3].tag === "button" && kids[3].classList.contains("danger"));
  assert.equal(kids[3].textContent, "מחיקה");
  assert.equal(usedInnerHTML(doc), false, "בלי innerHTML");
});
test("בוצעה, בלי תאריך", async () => {
  const { li } = await render({ id: 9, title: "לחם", status: "done", priority: "low", dueDate: null });
  assert.ok(li.classList.contains("done"));
  assert.equal(li.elementChildren[0].checked, true);
  assert.equal(li.querySelector(".meta").textContent, "low · בלי תאריך");
});
test("אירועים", async () => {
  const { li, calls } = await render({ id: 3, title: "x", status: "todo", priority: "medium", dueDate: "2027-01-05" });
  const box = li.elementChildren[0];
  box.checked = true;
  await fire(box, "change");
  box.checked = false;
  await fire(box, "change");
  await fire(li.querySelector("button"), "click");
  assert.deepEqual(calls, [["toggle", 3, true], ["toggle", 3, false], ["delete", 3]]);
});
