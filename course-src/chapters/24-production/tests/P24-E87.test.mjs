import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E87.ts", ["createLoginLimiter"])).createLoginLimiter;

test("לפי חשבון: רק כישלונות, ואיפוס בהצלחה", async () => {
  let t = 0;
  const lim = (await get())({ now: () => t });
  for (let i = 0; i < 5; i++) {
    assert.deepEqual(lim.check(`10.0.0.${i}`, "dana@example.com"), { allowed: true });
    lim.fail("dana@example.com");
    t += 1000;
  }
  assert.deepEqual(lim.check("10.0.0.99", "  Dana@Example.COM "), { allowed: false, reason: "email", retryAfterSeconds: 895 }, "15 דקות מהכישלון הראשון; אימייל מנורמל");
  assert.deepEqual(lim.check("10.0.0.99", "yossi@example.com"), { allowed: true }, "חשבון אחר — פתוח");
  t = 900_000;
  assert.deepEqual(lim.check("10.0.0.99", "dana@example.com"), { allowed: true }, "הכישלון הראשון יצא מהחלון");
  lim.succeed("DANA@example.com");
  lim.fail("dana@example.com");
  assert.deepEqual(lim.check("10.0.0.98", "dana@example.com"), { allowed: true });
});
test("הצלחות לא נספרות לחשבון", async () => {
  const lim = (await get())({ now: () => 0, perIp: { limit: 100, windowMs: 1000 } });
  for (let i = 0; i < 10; i++) {
    assert.equal(lim.check("1.1.1.1", "a@x.io").allowed, true);
    lim.succeed("a@x.io");
  }
});
test("לפי IP: כל הניסיונות שעברו; נדחים לא נספרים", async () => {
  let t = 0;
  const lim = (await get())({ now: () => t, perIp: { limit: 3, windowMs: 10_000 } });
  for (let i = 0; i < 3; i++) {
    assert.equal(lim.check("6.6.6.6", `user${i}@x.io`).allowed, true);
    t += 1000;
  }
  assert.deepEqual(lim.check("6.6.6.6", "other@x.io"), { allowed: false, reason: "ip", retryAfterSeconds: 7 });
  for (let i = 0; i < 5; i++) lim.check("6.6.6.6", "z@x.io");
  t = 10_000;
  assert.equal(lim.check("6.6.6.6", "z@x.io").allowed, true, "הנדחים לא האריכו את החסימה");
  assert.equal(lim.check("7.7.7.7", "z@x.io").allowed, true, "IP אחר");
});
test("IP נבדק לפני חשבון; ברירות מחדל", async () => {
  let t = 0;
  const lim = (await get())({ now: () => t });
  for (let i = 0; i < 5; i++) { lim.check("1.1.1.1", "v@x.io"); lim.fail("v@x.io"); }
  for (let i = 0; i < 15; i++) lim.check("1.1.1.1", `u${i}@x.io`);
  const r = lim.check("1.1.1.1", "v@x.io");
  assert.equal(r.reason, "ip", "20 ניסיונות מה־IP — חסום לפי IP");
  assert.equal(r.retryAfterSeconds, 60);
  t = 61_000;
  assert.equal(lim.check("1.1.1.1", "v@x.io").reason, "email");
});
