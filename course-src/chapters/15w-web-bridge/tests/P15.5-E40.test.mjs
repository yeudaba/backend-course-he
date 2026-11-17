import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E40.css"));
test(".row ו־.title", () => {
  const r = rules();
  const row = declsFor(r, ".row");
  assert.equal(row.display, "flex");
  assert.ok(row.gap, "gap");
  assert.equal(row["align-items"], "center");
  assert.ok(row.padding, "padding");
  assert.equal(declsFor(r, ".row .title").flex, "1", ".row .title { flex: 1 }");
});
test("משימה שבוצעה ורשימה", () => {
  const r = rules();
  const done = declsFor(r, ".row.done .title");
  assert.equal(done["text-decoration"], "line-through", ".row.done .title — בלי רווח בין row ל־done");
  assert.ok(done.color, "color");
  const list = declsFor(r, ".list");
  assert.equal(list["list-style"], "none");
  assert.match(list.padding ?? "", /^0(px)?$/);
  assert.match(list.margin ?? "", /^0(px)?$/);
});
