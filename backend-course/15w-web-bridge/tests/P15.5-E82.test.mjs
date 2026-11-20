import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E82.css"));

test(".card: עד 560px, במרכז", () => {
  const c = declsFor(rules(), ".card");
  assert.equal(c["max-width"], "560px", "max-width: 560 בלי יחידה הוא לא תקין — הדפדפן מתעלם ממנו");
  assert.match(c.margin ?? "", /\bauto\b/, "margin עם auto — למרכז");
});
test(".tags: שורה בלי תבליטים", () => {
  const r = rules();
  const t = declsFor(r, ".tags");
  assert.equal(t.display, "flex", "display: flex על ההורה (.tags), לא על הילדים");
  assert.equal(t["list-style"] ?? t["list-style-type"], "none", "בלי תבליטים: list-style: none");
  assert.notEqual(declsFor(r, ".tags li").display, "flex", "display: flex על כל li לא מסדר אותם בשורה");
});
test("שדות: 100% כולל padding", () => {
  const r = rules();
  const sizing = declsFor(r, "*")["box-sizing"] ?? declsFor(r, "input")["box-sizing"];
  assert.equal(sizing, "border-box", "בלי box-sizing: border-box, ‏100% ועוד padding יוצא רחב מההורה");
  if (!declsFor(r, "*")["box-sizing"]) assert.equal(declsFor(r, "textarea")["box-sizing"], "border-box", "גם textarea");
});
test(".actions: הכפתור בסוף", () => {
  const a = declsFor(rules(), ".actions");
  assert.equal(a.display, "flex", "justify-content עובד רק עם display: flex");
  assert.equal(a["justify-content"], "flex-end");
});
