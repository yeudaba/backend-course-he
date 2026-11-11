import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P25-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["bucketOf", "isEnabled"]);
const ref = (flag, user) => createHash("sha256").update(`${flag}:${user}`).digest().readUInt32BE(0) % 100;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("bucketOf — sha256 של flag:userId, ארבעת הבתים הראשונים, מודולו 100", async () => {
  const { bucketOf } = await get();
  assert.equal(bucketOf("new-checkout", "user-1"), 83);
  assert.equal(bucketOf("new-checkout", "user-2"), 61);
  assert.equal(bucketOf("dark-mode", "user-1"), 20, "אותו משתמש, דגל אחר — דלי אחר (שם הדגל בתוך ה־hash)");
  for (let i = 0; i < 200; i++) assert.equal(bucketOf("f", `u${i}`), ref("f", `u${i}`), `u${i}`);
  assert.equal(bucketOf("f", "u7"), bucketOf("f", "u7"), "אותה תשובה בכל קריאה");
});
test("isEnabled — כבוי, לא קיים, allow, 0% ו־100%", async () => {
  const { isEnabled } = await get();
  const flags = {
    off: { enabled: false, percent: 100, allow: ["qa"] },
    zero: { enabled: true, percent: 0, allow: ["qa"] },
    all: { enabled: true, percent: 100 },
  };
  assert.equal(isEnabled(flags, "off", "qa"), false, "דגל כבוי — כבוי לכולם, גם ל־allow");
  assert.equal(isEnabled(flags, "missing", "u1"), false, "דגל שלא קיים — false, לא שגיאה");
  assert.equal(isEnabled(flags, "zero", "qa"), true, "allow עוקף את האחוז");
  assert.equal(isEnabled(flags, "zero", "u1"), false);
  for (let i = 0; i < 300; i++) assert.equal(isEnabled(flags, "all", `u${i}`), true, "100% — כולם");
});
test("פריסה הדרגתית: האחוז נשמר, ומי שקיבל — נשאר", async () => {
  const { isEnabled } = await get();
  const users = Array.from({ length: 10_000 }, (_, i) => `user-${i}`);
  const on = (percent) => new Set(users.filter((u) => isEnabled({ f: { enabled: true, percent } }, "f", u)));
  const ten = on(10);
  const twenty = on(20);
  assert.ok(ten.size > 900 && ten.size < 1100, `10% מתוך 10,000 צריך להיות בערך 1,000 (קיבלנו ${ten.size})`);
  for (const u of ten) assert.ok(twenty.has(u), `${u} קיבל את הדגל ב־10% ואיבד אותו ב־20% — bucket < percent`);
  for (const u of users.slice(0, 500)) assert.equal(ten.has(u), ref("f", u) < 10, u);
});
