import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E42.css"));
test(".message", () => {
  const m = declsFor(rules(), ".message");
  for (const k of ["padding", "border-radius", "margin"]) assert.ok(m[k], `.message { ${k} }`);
});
test("error ו־info", () => {
  const r = rules();
  const e = declsFor(r, ".message.error");
  const i = declsFor(r, ".message.info");
  for (const [name, d] of [[".message.error", e], [".message.info", i]]) {
    assert.ok(d.background || d["background-color"], `${name} { background }`);
    assert.ok(d.color, `${name} { color }`);
    assert.match(d.border ?? "", /\bsolid\b/, `${name} { border: ... solid ... }`);
  }
  assert.notEqual(e.background ?? e["background-color"], i.background ?? i["background-color"], "רקעים שונים");
  assert.notEqual(e.color, i.color, "צבעי טקסט שונים");
  assert.notEqual(e.border, i.border, "מסגרות שונות");
});
test("רשימה ו־[hidden]", () => {
  const r = rules();
  const ul = declsFor(r, ".message ul");
  assert.ok(ul.margin !== undefined && ul["padding-inline-start"], ".message ul { margin, padding-inline-start }");
  assert.equal(declsFor(r, "[hidden]").display, "none", "[hidden] { display: none }");
});
