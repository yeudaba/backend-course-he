import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E25.html"));
test("form", () => {
  const form = qs(doc(), "form");
  assert.ok(form, "חסר form");
  assert.equal(form.attrs.action, "/products");
  assert.equal((form.attrs.method ?? "").toLowerCase(), "get");
});
test("שדות", () => {
  const d = doc();
  assert.equal(qs(d, "form input[name=q]")?.attrs.type, "search", 'input type="search" בשם q');
  const sort = qs(d, "form select[name=sort]");
  assert.ok(sort, "select בשם sort");
  const opts = qsa(sort, "option");
  assert.deepEqual(opts.map((o) => o.attrs.value), ["price", "-price", "name"], "3 אפשרויות עם הערכים price, -price, name");
  assert.deepEqual(opts.filter((o) => "selected" in o.attrs).map((o) => o.attrs.value), ["name"], "רק name מסומן selected");
  const max = qs(d, "form input[name=maxPrice]");
  assert.equal(max?.attrs.type, "number", 'input type="number" בשם maxPrice');
  assert.equal(max.attrs.min, "0", 'min="0"');
});
test("labels וכפתור", () => {
  const d = doc();
  const fors = new Set(qsa(d, "label[for]").map((l) => l.attrs.for));
  for (const name of ["q", "sort", "maxPrice"]) {
    const f = qs(d, `form [name=${name}]`);
    assert.ok(f?.attrs.id && fors.has(f.attrs.id), `לשדה ${name} חסר label מחובר`);
  }
  assert.ok(qsa(d, "form button").some((b) => (b.attrs.type ?? "submit") === "submit"), "כפתור שליחה");
});
