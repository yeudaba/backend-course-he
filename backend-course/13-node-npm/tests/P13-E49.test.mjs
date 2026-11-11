import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { exportsOf } from "./_src.mjs";
import { target } from "../../tools/load.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E49.mjs", ["runSum"])).runSum;
function io() {
  const out = [];
  const err = [];
  return { out, err, io: { log: (x) => out.push(x), error: (x) => err.push(x) } };
}

test("סכום ← log וקוד 0", async () => {
  const runSum = await get();
  const t = io();
  assert.equal(runSum(["1", "2", "3.5"], t.io), 0);
  assert.deepEqual(t.out, [6.5]);
  assert.deepEqual(t.err, []);
  const t2 = io();
  assert.equal(runSum([" -4 ", "4"], t2.io), 0);
  assert.deepEqual(t2.out, [0]);
});
test("בלי ארגומנטים ← קוד 2", async () => {
  const runSum = await get();
  const t = io();
  assert.equal(runSum([], t.io), 2);
  assert.deepEqual(t.err, ["שימוש: sum <מספרים...>"]);
  assert.deepEqual(t.out, []);
});
test("לא מספר ← קוד 1, בלי סכום", async () => {
  const runSum = await get();
  for (const [args, bad] of [[["1", "abc", "x"], "abc"], [["1", ""], ""], [["  "], "  "]]) {
    const t = io();
    assert.equal(runSum(args, t.io), 1, `runSum(${JSON.stringify(args)})`);
    assert.deepEqual(t.err, [`"${bad}" אינו מספר`]);
    assert.deepEqual(t.out, [], "אחרי ארגומנט לא תקין לא מדפיסים סכום");
  }
});
test("הרצה אמיתית: קוד יציאה ופלט", () => {
  const file = target(import.meta.url, "P13-E49.mjs");
  const ok = spawnSync(process.execPath, [file, "1", "2", "3.5"], { encoding: "utf8" });
  assert.equal(ok.status, 0, "node P13-E49.mjs 1 2 3.5 צריך לצאת עם 0 — הוסף את בלוק ה־import.meta.main");
  assert.match(ok.stdout, /^6\.5$/m);
  const bad = spawnSync(process.execPath, [file, "1", "x"], { encoding: "utf8" });
  assert.equal(bad.status, 1, "עם ארגומנט לא תקין — קוד יציאה 1 (process.exitCode)");
});
