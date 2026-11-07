import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { escapeHtml, renderTaskItem } = await load(import.meta.url, "P15.5-E06.mjs");

test("escapeHtml", () => {
  assert.equal(escapeHtml(`<a href="x" title='y'>Tom & Jerry</a>`), "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;Tom &amp; Jerry&lt;/a&gt;");
  assert.equal(escapeHtml("&lt;"), "&amp;lt;", "& קודם — אחרת קידוד כפול שגוי");
  assert.equal(escapeHtml(42), "42");
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml("שלום"), "שלום");
});
test("renderTaskItem", () => {
  assert.equal(renderTaskItem({ title: "ללמוד", priority: "low" }), '<li class="task low">ללמוד</li>');
  assert.equal(renderTaskItem({ title: "<b>x</b>", priority: 'a" onclick="x' }), '<li class="task a&quot; onclick=&quot;x">&lt;b&gt;x&lt;/b&gt;</li>');
});
