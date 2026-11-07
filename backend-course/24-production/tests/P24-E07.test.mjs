import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { redact } = await load(import.meta.url, "P24-E07.ts");

test("מפתחות סודיים — בכל עומק", () => {
  const input = { email: "dana@example.com", password: "p4ss", profile: { refreshToken: "rt", name: "דנה" }, list: [{ token: "t1" }, { ok: 1 }] };
  assert.deepEqual(redact(input), { email: "dana@example.com", password: "[REDACTED]", profile: { refreshToken: "[REDACTED]", name: "דנה" }, list: [{ token: "[REDACTED]" }, { ok: 1 }] });
});
test("בלי תלות באותיות גדולות/קטנות", () => {
  assert.deepEqual(redact({ Authorization: "x", PASSWORD: "y", Cookie: "z" }), { Authorization: "[REDACTED]", PASSWORD: "[REDACTED]", Cookie: "[REDACTED]" });
});
test("לא משנה את המקור", () => {
  const input = { password: "p", nested: { token: "t" } };
  redact(input);
  assert.deepEqual(input, { password: "p", nested: { token: "t" } });
});
test("ערכים שאינם אובייקט", () => {
  assert.equal(redact(5), 5);
  assert.equal(redact(null), null);
  assert.equal(redact("hello"), "hello");
  assert.deepEqual(redact([1, "a"]), [1, "a"]);
});
test("Bearer בתוך מחרוזת", () => {
  assert.deepEqual(redact({ headers: { "x-auth": "Bearer eyJhbGciOi.abc.def" } }), { headers: { "x-auth": "Bearer [REDACTED]" } });
});
test("רשימת מפתחות משלך", () => {
  assert.deepEqual(redact({ password: "p", ssn: "123" }, ["ssn"]), { password: "p", ssn: "[REDACTED]" });
});
test("Date ← ISO, ומעגלים לא מפילים", () => {
  const a = { at: new Date("2026-11-04T10:00:00Z") };
  a.self = a;
  assert.deepEqual(redact(a), { at: "2026-11-04T10:00:00.000Z", self: "[Circular]" });
  const shared = { n: 1 };
  assert.deepEqual(redact({ x: shared, y: shared }), { x: { n: 1 }, y: { n: 1 } }, "אותו אובייקט פעמיים (לא מעגל) — מופיע פעמיים");
});
