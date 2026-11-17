// P22-E47 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { retry } from "./P22-E47.ts";

const failing = (...messages: string[]) => {
  const fn = mock.fn(async () => "ok");
  // הארגומנט השני: באיזו קריאה (0, 1, 2...). בלעדיו, שתי קריאות לפני הפעלה דורסות זו את זו
  messages.forEach((m, i) => fn.mock.mockImplementationOnce(async () => { throw new Error(m); }, i));
  return fn;
};

test("מצליח בפעם הראשונה — בלי המתנה", async () => {
  const fn = failing();
  const sleep = mock.fn(async (_ms: number) => {});
  assert.equal(await retry(fn, { sleep }), "ok");
  assert.equal(fn.mock.callCount(), 1);
  assert.equal(sleep.mock.callCount(), 0);
});

test("נכשל פעמיים ואז מצליח — המתנות מוכפלות", async () => {
  const fn = failing("1", "2");
  const sleep = mock.fn(async (_ms: number) => {});
  assert.equal(await retry(fn, { sleep }), "ok");
  assert.equal(fn.mock.callCount(), 3);
  assert.deepEqual(sleep.mock.calls.map((c) => c.arguments[0]), [100, 200]);
});

test("כולם נכשלים — השגיאה האחרונה, בלי המתנה אחרי האחרון", async () => {
  const fn = failing("1", "2", "3", "4");
  const sleep = mock.fn(async (_ms: number) => {});
  await assert.rejects(retry(fn, { attempts: 3, delayMs: 10, sleep }), { message: "3" });
  assert.equal(fn.mock.callCount(), 3);
  assert.deepEqual(sleep.mock.calls.map((c) => c.arguments[0]), [10, 20]);
});

test("attempts: 1 — ניסיון אחד", async () => {
  const fn = failing("only");
  const sleep = mock.fn(async (_ms: number) => {});
  await assert.rejects(retry(fn, { attempts: 1, sleep }), { message: "only" });
  assert.equal(fn.mock.callCount(), 1);
  assert.equal(sleep.mock.callCount(), 0);
});

test("attempts לא תקין ← RangeError", async () => {
  for (const attempts of [0, -1, 1.5]) {
    await assert.rejects(retry(async () => "x", { attempts, sleep: async () => {} }), RangeError, `attempts ${attempts}`);
  }
});
