import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseCss, declsFor } from "./_html.mjs";

const rules = () => parseCss(readStarter(import.meta.url, "P15.5-E05-profile.css"));

test("רקע אפור לדף, כרטיס לבן במרכז", () => {
  const r = rules();
  const body = { ...declsFor(r, "html"), ...declsFor(r, "body") };
  assert.ok(body.background || body["background-color"], "רקע (אפור בהיר) ל־body");
  const c = declsFor(r, ".card");
  assert.equal(c["max-width"], "560px", ".card: max-width: 560px");
  assert.match(c.margin ?? `${c["margin-left"]} ${c["margin-right"]}`, /\bauto\b/, ".card: margin עם auto — למרכז");
  assert.ok(c.padding, ".card: padding");
  assert.match((c.background ?? c["background-color"] ?? "").toLowerCase(), /^(white|#fff|#ffffff)$/, ".card: רקע לבן");
  assert.match(c.border ?? "", /^1px solid \S+/, ".card: border: 1px solid <צבע>");
  assert.ok(c["border-radius"], ".card: border-radius");
});
test("התגיות בשורה, בלי תבליטים", () => {
  const t = declsFor(rules(), ".tags");
  assert.equal(t.display, "flex", ".tags: display: flex");
  assert.ok(t.gap, ".tags: gap — רווח בין התגיות");
  assert.equal(t["list-style"] ?? t["list-style-type"], "none", ".tags: list-style: none");
});
test("label מעל, שדות ברוחב מלא", () => {
  const r = rules();
  assert.equal(declsFor(r, "label").display, "block", "label: display: block — כך הוא בשורה משלו, מעל השדה");
  for (const s of ["input", "textarea"]) assert.equal(declsFor(r, s).width, "100%", `${s}: width: 100%`);
});
test("הכפתור בסוף", () => {
  const a = declsFor(rules(), ".actions");
  assert.equal(a.display, "flex", ".actions: display: flex");
  assert.equal(a["justify-content"], "flex-end", ".actions: justify-content: flex-end (ב־RTL — שמאל)");
});
