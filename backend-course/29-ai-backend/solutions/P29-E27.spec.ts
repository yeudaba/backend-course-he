// P29-E27 — הבדיקות
import { test } from "node:test";
import assert from "node:assert/strict";
import { redactPII } from "./P29-E27.ts";

test("אימיילים — כולל + ודומיין עם כמה חלקים, וכולם (לא רק הראשון)", () => {
  assert.equal(redactPII("כתבו לי ל־dana@example.com"), "כתבו לי ל־[EMAIL]");
  assert.equal(redactPII("dana.levi+shop@mail.co.il"), "[EMAIL]");
  assert.equal(redactPII("a@x.io, b@y.io"), "[EMAIL], [EMAIL]");
});

test("כרטיס אשראי: 13–16 ספרות, עם רווחים או מקפים", () => {
  assert.equal(redactPII("כרטיס 4580123456789012 בבקשה"), "כרטיס [CARD] בבקשה");
  assert.equal(redactPII("4580 1234 5678 9012"), "[CARD]");
  assert.equal(redactPII("4580-1234-5678-9012"), "[CARD]");
  assert.equal(redactPII("1234567890123"), "[CARD]", "13 ספרות");
});

test("טלפון נייד: עם ובלי מקפים, ועם +972", () => {
  assert.equal(redactPII("התקשרו ל־0521234567"), "התקשרו ל־[PHONE]");
  assert.equal(redactPII("052-123-4567"), "[PHONE]");
  assert.equal(redactPII("052 123 4567"), "[PHONE]");
  assert.equal(redactPII("+972-52-123-4567"), "[PHONE]");
  assert.equal(redactPII("+972521234567"), "[PHONE]");
  assert.equal(redactPII("0521234567 ו־0549876543"), "[PHONE] ו־[PHONE]");
});

test("מה שלא מוחלפים", () => {
  for (const s of ["הזמנה מספר 123456789012", "ת.ז. 123456782", "טלפון בבית 03-1234567", "ב־2026 קניתי 3 שקיות", "dana at example dot com", "05212345678901234567"]) {
    assert.equal(redactPII(s), s, s);
  }
});
