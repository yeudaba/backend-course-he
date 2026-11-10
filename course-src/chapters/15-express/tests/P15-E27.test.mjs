import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P15-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["signupSchema"])).signupSchema;
const ok = { username: "dana", phone: "0501234567", password: "Secret123" };

// מחזיר את ההודעות של שדה אחד, או [] אם עבר
async function messages(input, field) {
  const r = (await get()).safeParse({ ...ok, ...input });
  return r.success ? [] : r.error.issues.filter((i) => i.path[0] === field).map((i) => i.message);
}

test("עובר בדיקת טיפוסים, ומייצא type Signup", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import type { Signup } from "FILE";
const s: Signup = { username: "a", phone: "b", password: "c" };
// @ts-expect-error — phone הוא string
const bad: Signup = { username: "a", phone: 5, password: "c" };
`);
  assert.ok(p.ok, p.message);
});
test("קלט תקין — ניקוי ואיחוד צורה", async () => {
  const schema = await get();
  assert.deepEqual(schema.parse({ username: " Dana_88 ", phone: "+972 50-123-4567", password: "Secret123" }), { username: "dana_88", phone: "0501234567", password: "Secret123" });
  for (const phone of ["050-1234567", "0501234567", " 054 123 4567 ", "+972501234567", "+972-52-765-4321"]) {
    const r = schema.safeParse({ ...ok, phone });
    assert.ok(r.success, `הטלפון ${JSON.stringify(phone)} תקין`);
    assert.match(r.data.phone, /^05\d{8}$/, `${JSON.stringify(phone)} צריך להפוך ל־05XXXXXXXX, וקיבלנו ${r.data.phone}`);
  }
});
test("username", async () => {
  const MSG = "שם משתמש: 3–16 תווים — אותיות באנגלית, ספרות ו־_, ומתחיל באות";
  for (const username of ["ab", "8dana", "_dana", "dana!", "דנה", "a".repeat(17), "dana smith"]) {
    assert.deepEqual(await messages({ username }, "username"), [MSG], `username: ${JSON.stringify(username)}`);
  }
  for (const username of ["abc", "a".repeat(16), "DANA", "x_1"]) {
    assert.deepEqual(await messages({ username }, "username"), [], `username: ${JSON.stringify(username)} תקין`);
  }
});
test("phone", async () => {
  const MSG = "טלפון נייד ישראלי: 05XXXXXXXX";
  for (const phone of ["03-1234567", "050123456", "05012345678", "+97250123456", "972501234567", "050-123456a", ""]) {
    assert.deepEqual(await messages({ phone }, "phone"), [MSG], `phone: ${JSON.stringify(phone)}`);
  }
});
test("password — כל ההודעות", async () => {
  assert.deepEqual(await messages({ password: "secret" }, "password"), ["סיסמה: לפחות 8 תווים", "סיסמה: לפחות אות גדולה אחת", "סיסמה: לפחות ספרה אחת"], "שלוש בדיקות נפרדות, כל אחת עם הודעה משלה, לפי הסדר");
  assert.deepEqual(await messages({ password: "secretpass1" }, "password"), ["סיסמה: לפחות אות גדולה אחת"]);
  assert.deepEqual(await messages({ password: "SecretPass" }, "password"), ["סיסמה: לפחות ספרה אחת"]);
  assert.deepEqual(await messages({ password: "Ab1" }, "password"), ["סיסמה: לפחות 8 תווים"]);
});
test("משתמשים ב־regex", () => {
  const n = (code(import.meta.url, FILE).match(/\.regex\s*\(/g) ?? []).length;
  assert.ok(n >= 3, `מצאתי ${n} קריאות ל־.regex(...) — התרגיל מתרגל regex: לפחות username, ‏phone ושתיים בסיסמה`);
});
