import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E46.ts";
const get = () => exportsOf(import.meta.url, FILE, ["InsufficientFundsError", "AccountLockedError", "withdraw"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שדות readonly", () => {
  const r = typeProbe(import.meta.url, FILE, `import { InsufficientFundsError, withdraw } from "FILE";
const e = new InsufficientFundsError(10, 5);
const n: number = e.needed + e.available;
// @ts-expect-error — needed הוא readonly
e.needed = 1;
const b: number = withdraw(1, 1, false);
export { n, b };
`);
  assert.ok(r.ok, r.message);
});
test("מחלקות השגיאה", async () => {
  const { InsufficientFundsError, AccountLockedError } = await get();
  const e = new InsufficientFundsError(150, 100);
  assert.ok(e instanceof Error);
  assert.equal(e.message, "נדרשים 150, יש 100");
  assert.equal(e.name, "InsufficientFundsError");
  assert.equal(e.needed, 150);
  assert.equal(e.available, 100);
  const l = new AccountLockedError();
  assert.ok(l instanceof Error);
  assert.equal(l.message, "החשבון נעול");
  assert.equal(l.name, "AccountLockedError");
  assert.equal(String(l), "AccountLockedError: החשבון נעול");
});
test("withdraw", async () => {
  const { withdraw, InsufficientFundsError, AccountLockedError } = await get();
  assert.equal(withdraw(100, 30, false), 70);
  assert.equal(withdraw(100, 100, false), 0);
  assert.throws(() => withdraw(100, 150, false), (e) => e instanceof InsufficientFundsError && e.needed === 150 && e.available === 100);
  assert.throws(() => withdraw(100, 1, true), (e) => e instanceof AccountLockedError);
  assert.throws(() => withdraw(10, 50, true), (e) => e instanceof AccountLockedError, "קודם נעילה, אחר כך יתרה");
});
