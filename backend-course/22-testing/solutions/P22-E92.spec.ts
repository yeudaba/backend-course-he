// P22-E92 — בדיקות ל־parseRegister
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRegister } from "./P22-E92.ts";

test("תקין — אימייל מנורמל, סיסמה כמו שהיא", () => {
  assert.deepEqual(parseRegister({ email: "  Dana@Example.COM ", password: "correct horse " }), {
    ok: true,
    data: { email: "dana@example.com", password: "correct horse " },
  });
});

const valid: [string, string][] = [
  ["8 תווים", "12345678"],
  ["36 אותיות עבריות = 72 בתים", "ש".repeat(36)],
  ["72 תווים לטיניים", "a".repeat(72)],
];
for (const [name, password] of valid) {
  test(`סיסמה תקינה: ${name}`, () => {
    assert.equal(parseRegister({ email: "a@b.co", password }).ok, true);
  });
}

const invalid: [string, unknown][] = [
  ["7 תווים", { email: "a@b.co", password: "1234567" }],
  ["37 אותיות עבריות = 74 בתים", { email: "a@b.co", password: "ש".repeat(37) }],
  ["73 תווים לטיניים", { email: "a@b.co", password: "a".repeat(73) }],
  ["אימייל לא תקין", { email: "not-an-email", password: "long-enough" }],
  ["שדה role", { email: "a@b.co", password: "long-enough", role: "admin" }],
  ["בלי סיסמה", { email: "a@b.co" }],
];
for (const [name, body] of invalid) {
  test(`נדחה: ${name}`, () => {
    const r = parseRegister(body);
    assert.equal(r.ok, false);
    assert.ok(r.errors.length > 0);
  });
}
