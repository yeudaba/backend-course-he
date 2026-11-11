import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E38.css"));
test("* ו־body", () => {
  const r = rules();
  assert.equal(declsFor(r, "*")["box-sizing"], "border-box", "* { box-sizing: border-box }");
  const body = declsFor(r, "body");
  assert.match(body.margin ?? "", /^0(px)?$/, "body { margin: 0 }");
  assert.match(body["font-family"] ?? "", /^system-ui\b/, "font-family שמתחיל ב־system-ui");
  const lh = Number(body["line-height"]);
  assert.ok(lh >= 1.3 && lh <= 1.8, "line-height — מספר בלי יחידה, בין 1.3 ל־1.8");
  assert.ok(body.background || body["background-color"], "background ל־body");
});
test("h1 ו־a", () => {
  const r = rules();
  const m = (declsFor(r, "h1")["font-size"] ?? "").match(/^([\d.]+)rem$/);
  assert.ok(m && Number(m[1]) >= 1.5 && Number(m[1]) <= 3, "h1 { font-size: Xrem } עם X בין 1.5 ל־3");
  assert.ok(declsFor(r, "a").color, "a { color: ... }");
});
