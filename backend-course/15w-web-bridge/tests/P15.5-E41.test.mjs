import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E41.css"));
const bg = (d) => (d.background ?? d["background-color"] ?? "").toLowerCase();
test("button", () => {
  const b = declsFor(rules(), "button");
  for (const k of ["padding", "border-radius", "color"]) assert.ok(b[k], `button { ${k} }`);
  assert.equal(b.border, "none");
  assert.equal(b.cursor, "pointer");
  assert.ok(bg(b), "button { background }");
});
test("מצבים — ארבעה רקעים שונים", () => {
  const r = rules();
  const all = [bg(declsFor(r, "button")), bg(declsFor(r, "button:hover")), bg(declsFor(r, "button.danger")), bg(declsFor(r, "button.danger:hover"))];
  assert.ok(all.every(Boolean), "רקע ל־button, button:hover, button.danger ו־button.danger:hover");
  assert.equal(new Set(all).size, 4, "ארבעת הרקעים שונים זה מזה");
});
test("disabled", () => {
  const d = declsFor(rules(), "button:disabled");
  assert.ok(Number(d.opacity) < 1 && Number(d.opacity) >= 0, "opacity קטן מ־1");
  assert.equal(d.cursor, "not-allowed");
});
