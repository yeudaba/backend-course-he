import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";
import { calls } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E60.js", ["series"]);

test("ברצף: כל משימה מתחילה אחרי שהקודמת סיימה", async () => {
  const { series } = await get();
  const log = [];
  const task = (name, ms) => (done) => {
    log.push(`start ${name}`);
    setTimeout(() => { log.push(`end ${name}`); done(null, name); }, ms);
  };
  const c = await calls((cb) => series([task("a", 20), task("b", 5), task("c", 10)], cb));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים`);
  assert.deepEqual(c[0].args, [null, ["a", "b", "c"]]);
  assert.deepEqual(log, ["start a", "end a", "start b", "end b", "start c", "end c"], "משימה מתחילה רק אחרי ש־done של הקודמת נקראה");
});
test("שגיאה ← callback(err) מיד, והשאר לא רצות", async () => {
  const { series } = await get();
  const ran = [];
  const c = await calls((cb) =>
    series([
      (done) => { ran.push(1); setTimeout(() => done(null, 1), 5); },
      (done) => { ran.push(2); setTimeout(() => done(new Error("נכשל בשלב 2")), 5); },
      (done) => { ran.push(3); done(null, 3); },
    ], cb),
  );
  assert.equal(c.length, 1);
  assert.equal(c[0].args[0]?.message, "נכשל בשלב 2");
  assert.deepEqual(ran, [1, 2], "אחרי שגיאה לא ממשיכים לשלב הבא");
});
test("משימות שקוראות ל־done מיד, ומערך ריק", async () => {
  const { series } = await get();
  const c = await calls((cb) => series([(d) => d(null, "x"), (d) => d(null, undefined), (d) => d(null, 0)], cb));
  assert.deepEqual(c[0].args, [null, ["x", undefined, 0]]);
  const e = await calls((cb) => series([], cb));
  assert.equal(e.length, 1);
  assert.deepEqual(e[0].args, [null, []]);
  assert.equal(e[0].sync, false, "גם עם מערך ריק ה־callback מגיע אחר כך");
});
