import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E81.html"));
const field = (d, name) => qs(d, `form#signup [name=${name}]`);

test("הטופס נשלח ב־POST ל־/signup, עם כפתור שליחה", () => {
  const d = doc();
  const form = qs(d, "form#signup");
  assert.ok(form, '<form id="signup">');
  assert.equal((form.attrs.method ?? "").toLowerCase(), "post");
  assert.equal(form.attrs.action, "/signup");
  const buttons = qsa(d, "form#signup button");
  const submit = buttons.find((b) => (b.attrs.type ?? "submit") === "submit");
  assert.ok(submit, 'אין כפתור שליחה — type="button" לא שולח את הטופס');
  assert.equal(cleanText(submit), "הרשמה");
});
test("שלושת השדות נשלחים (name)", () => {
  const d = doc();
  for (const n of ["name", "email", "password"]) assert.ok(field(d, n), `אין שדה עם name="${n}" — שדה בלי name לא נשלח`);
});
test("types ו־required", () => {
  const d = doc();
  assert.equal(field(d, "email").attrs.type, "email");
  assert.equal(field(d, "password").attrs.type, "password", "סיסמה עם type=password — אחרת היא גלויה על המסך");
  assert.equal(field(d, "password").attrs.minlength, "8");
  for (const n of ["name", "email", "password"]) assert.ok("required" in field(d, n).attrs, `${n}: required`);
});
test("label מחובר לכל שדה", () => {
  const d = doc();
  const fors = new Set(qsa(d, "label[for]").map((l) => l.attrs.for));
  for (const n of ["name", "email", "password"]) {
    const f = field(d, n);
    assert.ok(f.attrs.id && fors.has(f.attrs.id), `לשדה ${n} אין label עם for שמתאים ל־id שלו`);
  }
});
