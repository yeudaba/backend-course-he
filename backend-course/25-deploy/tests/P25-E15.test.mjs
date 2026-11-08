import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { nextVersion } = await load(import.meta.url, "P25-E15.ts");

test("patch / minor / major", () => {
  assert.deepEqual(nextVersion("1.4.2", ["fix: 404 על משימה של משתמש אחר", "chore: deps"]).version, "1.4.3");
  assert.equal(nextVersion("1.4.2", ["fix: x", "feat(tasks): סינון לפי תאריך"]).version, "1.5.0", "minor מאפס patch");
  assert.equal(nextVersion("1.4.2", ["feat!: מחיקת /v1"]).version, "2.0.0");
  assert.equal(nextVersion("1.4.2", ["refactor: x\n\nBREAKING CHANGE: שדה dueDate עכשיו חובה"]).version, "2.0.0", "BREAKING CHANGE בגוף ההודעה");
  assert.equal(nextVersion("0.9.9", ["feat: x"]).version, "0.10.0", "מספרים, לא מחרוזות");
});
test("בלי שינויים — אותה גרסה", () => {
  assert.deepEqual(nextVersion("1.0.0", ["docs: README", "ci: cache", "Merge branch main"]), { version: "1.0.0", bump: "none", notes: "" });
});
test("notes מקובצות", () => {
  const { notes, bump } = nextVersion("1.0.0", ["feat(auth): PATCH /auth/me", "fix: Retry-After בשניות", "feat: Idempotency-Key", "fix(tasks)!: status לא מקבל null"]);
  assert.equal(bump, "major");
  assert.equal(notes, "### ⚠️ שינויים שוברים\n- tasks: status לא מקבל null\n\n### ✨ חדש\n- auth: PATCH /auth/me\n- Idempotency-Key\n\n### 🐛 תיקונים\n- Retry-After בשניות");
});
test("גרסה לא תקינה", () => {
  assert.throws(() => nextVersion("v1.2", []), /גרסה לא תקינה/);
});
