// P22-E12 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./P22-E12.ts";

test("רץ פעם אחת, אחרי ההמתנה, עם הארגומנטים האחרונים", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = mock.fn();
  const save = debounce(fn, 300);
  save("a");
  t.mock.timers.tick(200);
  save("ab");
  t.mock.timers.tick(299);
  assert.equal(fn.mock.callCount(), 0, "עוד לא עברו 300ms מהקריאה האחרונה");
  t.mock.timers.tick(1);
  assert.equal(fn.mock.callCount(), 1);
  assert.deepEqual(fn.mock.calls[0].arguments, ["ab"]);
});

test("cancel מבטל", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = mock.fn();
  const save = debounce(fn, 300);
  save("x");
  save.cancel();
  t.mock.timers.tick(1000);
  assert.equal(fn.mock.callCount(), 0);
});

test("שתי סדרות נפרדות ← שתי קריאות", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = mock.fn();
  const save = debounce(fn, 100);
  save(1);
  t.mock.timers.tick(100);
  save(2);
  t.mock.timers.tick(100);
  assert.equal(fn.mock.callCount(), 2);
});
