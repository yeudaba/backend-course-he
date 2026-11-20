import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { fakeDocument, usedInnerHTML } from "./_html.mjs";

const mod = () => exportsOf(import.meta.url, "P15.5-E83.mjs", ["renderList", "createTask"]);

test("renderList: כותרת כטקסט, בלי innerHTML", async () => {
  const { renderList } = await mod();
  const doc = fakeDocument('<ul id="list"></ul>');
  const ul = doc.querySelector("#list");
  renderList(doc, ul, [{ id: 1, title: "<img src=x onerror=alert(1)>" }, { id: 2, title: "לחם" }]);
  assert.equal(usedInnerHTML(doc), false, "innerHTML עם כותרת של משתמש מריץ קוד — textContent");
  assert.deepEqual(ul.querySelectorAll("li").map((li) => li.textContent), ["<img src=x onerror=alert(1)>", "לחם"]);
});
test("renderList: קריאה חוזרת מחליפה, לא מוסיפה", async () => {
  const { renderList } = await mod();
  const doc = fakeDocument('<ul id="list"><li>ישן</li></ul>');
  const ul = doc.querySelector("#list");
  renderList(doc, ul, [{ id: 1, title: "א" }]);
  renderList(doc, ul, [{ id: 1, title: "א" }, { id: 2, title: "ב" }]);
  assert.deepEqual(ul.querySelectorAll("li").map((li) => li.textContent), ["א", "ב"], "הרשימה מוכפלת — replaceChildren");
});
test("renderList: רשימה ריקה", async () => {
  const { renderList } = await mod();
  const doc = fakeDocument('<ul id="list"><li>x</li></ul>');
  const ul = doc.querySelector("#list");
  renderList(doc, ul, []);
  const items = ul.querySelectorAll("li");
  assert.equal(items.length, 1);
  assert.ok(items[0].classList.contains("empty"));
  assert.equal(items[0].textContent, "אין משימות");
  assert.equal(usedInnerHTML(doc), false);
});

function fakeFetch(status, body) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  return { fn, calls };
}

test("createTask: POST עם JSON ו־Content-Type", async () => {
  const { createTask } = await mod();
  const f = fakeFetch(201, { id: 9, title: "חלב" });
  assert.deepEqual(await createTask("http://localhost:3000", "חלב", f.fn), { id: 9, title: "חלב" });
  const { url, init } = f.calls[0];
  assert.equal(url, "http://localhost:3000/tasks");
  assert.equal(init.method, "POST");
  const headers = Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  assert.match(headers["content-type"] ?? "", /^application\/json/, "בלי Content-Type: application/json השרת לא קורא את הגוף");
  assert.deepEqual(JSON.parse(init.body), { title: "חלב" });
});
test("createTask: תשובה שאינה ok ← שגיאה עם ההודעה מהשרת", async () => {
  const { createTask } = await mod();
  await assert.rejects(createTask("http://x", "", fakeFetch(400, { error: { code: "VALIDATION_ERROR", message: "title חובה" } }).fn), { message: "title חובה" });
  await assert.rejects(createTask("http://x", "a", fakeFetch(500, {}).fn), /500/, "בלי error.message — לפחות HTTP 500");
});
