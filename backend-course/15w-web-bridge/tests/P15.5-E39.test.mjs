import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E39.css"));
test(".card", () => {
  const c = declsFor(rules(), ".card");
  assert.match((c.background ?? c["background-color"] ?? "").toLowerCase(), /^(white|#fff|#ffffff)$/, "רקע לבן");
  assert.match(c.border ?? "", /^1px solid \S+/, "border: 1px solid <צבע>");
  const r = (c["border-radius"] ?? "").match(/^(\d+)px$/);
  assert.ok(r && Number(r[1]) >= 8, "border-radius של 8px לפחות");
  assert.equal(c.padding, "16px");
  assert.ok(c["margin-bottom"], "margin-bottom");
});
test(".card h2", () => {
  const h = declsFor(rules(), ".card h2");
  assert.match(h["margin-top"] ?? "", /^0(px)?$/, "margin-top: 0");
  assert.match(h["font-size"] ?? "", /^[\d.]+rem$/, "font-size ב־rem");
  assert.equal(Object.keys(declsFor(rules(), "h2")).length, 0, "אין כלל ל־h2 לבד (או .card, h2 עם פסיק) — רק h2 בתוך .card");
});
