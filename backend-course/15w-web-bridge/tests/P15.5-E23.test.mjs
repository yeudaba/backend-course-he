import { test } from "node:test";
import assert from "node:assert/strict";
import { readStarter, parseHtml, qs, qsa, cleanText } from "./_html.mjs";

const doc = () => parseHtml(readStarter(import.meta.url, "P15.5-E23.html"));
const field = (d, name) => qs(d, `form#login [name=${name}]`);
test("הטופס והשדות", () => {
  const d = doc();
  assert.ok(qs(d, "form#login"), '<form id="login">');
  const email = field(d, "email");
  assert.equal(email?.tag, "input", "input בשם email");
  assert.equal(email.attrs.type, "email");
  assert.ok("required" in email.attrs, "email: required");
  assert.equal(email.attrs.autocomplete, "email");
  const pw = field(d, "password");
  assert.equal(pw?.attrs.type, "password", "input בשם password עם type=password");
  assert.ok("required" in pw.attrs, "password: required");
  assert.equal(pw.attrs.minlength, "8", 'minlength="8"');
  assert.equal(field(d, "remember")?.attrs.type, "checkbox", "checkbox בשם remember");
});
test("label לכל שדה, ids ייחודיים", () => {
  const d = doc();
  const ids = qsa(d, "[id]").map((e) => e.attrs.id);
  assert.equal(new Set(ids).size, ids.length, "כל id ייחודי");
  const fors = new Set(qsa(d, "label[for]").map((l) => l.attrs.for));
  for (const name of ["email", "password", "remember"]) {
    const f = field(d, name);
    assert.ok(f?.attrs.id && fors.has(f.attrs.id), `לשדה ${name} חסר label עם for שמתאים ל־id שלו`);
  }
});
test("כפתור שליחה", () => {
  const d = doc();
  const b = qsa(d, "form#login button").find((x) => x.attrs.type === "submit");
  assert.ok(b, 'button type="submit"');
  assert.equal(cleanText(b), "כניסה");
});
