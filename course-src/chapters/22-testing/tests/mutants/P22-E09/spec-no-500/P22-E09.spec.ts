// P22-E09 — הבדיקות
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { HttpStatusError, withRetry } from "./P22-E09.ts";

test("הצלחה מיד — קריאה אחת", async () => {
  const fn = mock.fn(async () => "ok");
  assert.equal(await withRetry(fn), "ok");
  assert.equal(fn.mock.callCount(), 1);
});

test("נכשל פעמיים עם 503, ואז מצליח", async () => {
  let calls = 0;
  const fn = mock.fn(async () => {
    calls++;
    if (calls < 3) throw new HttpStatusError(503);
    return "ok";
  });
  assert.equal(await withRetry(fn), "ok");
  assert.equal(fn.mock.callCount(), 3);
});

test("נכשל תמיד — 1 + retries ניסיונות, וזורק את השגיאה האחרונה", async () => {
  let calls = 0;
  const fn = mock.fn(async () => {
    calls++;
    throw new Error(`ניסיון ${calls}`);
  });
  await assert.rejects(withRetry(fn, 2), { message: "ניסיון 3" });
  assert.equal(fn.mock.callCount(), 3);
});

test("4xx — לא מנסים שוב", async () => {
  const fn = mock.fn(async () => {
    throw new HttpStatusError(404);
  });
  await assert.rejects(withRetry(fn), HttpStatusError);
  assert.equal(fn.mock.callCount(), 1);
});

test("retries=0 — ניסיון אחד", async () => {
  const fn = mock.fn(async () => {
    throw new HttpStatusError(500);
  });
  await assert.rejects(withRetry(fn, 0));
  assert.equal(fn.mock.callCount(), 1);
});
