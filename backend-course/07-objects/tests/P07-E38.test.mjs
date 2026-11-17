import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E38.js";
const get = () => exportsOf(import.meta.url, FILE, ["createAccount"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("שדות התחלתיים", async () => {
  const { createAccount } = await get();
  const acc = createAccount("דנה");
  assert.equal(acc.owner, "דנה");
  assert.equal(acc.balance, 0);
});
test("deposit ו־withdraw", async () => {
  const { createAccount } = await get();
  const acc = createAccount("דנה");
  assert.equal(acc.deposit(200), true);
  assert.equal(acc.balance, 200);
  assert.equal(acc.withdraw(79.5), true);
  assert.equal(acc.balance, 120.5);
  assert.equal(acc.withdraw(500), false, "אי אפשר למשוך יותר מהיתרה");
  assert.equal(acc.balance, 120.5);
  assert.equal(acc.withdraw(120.5), true, "מותר למשוך בדיוק את כל היתרה");
  assert.equal(acc.balance, 0);
});
test("סכום לא חיובי ← false", async () => {
  const { createAccount } = await get();
  const acc = createAccount("x");
  assert.equal(acc.deposit(0), false);
  assert.equal(acc.deposit(-5), false);
  acc.deposit(10);
  assert.equal(acc.withdraw(-5), false);
  assert.equal(acc.balance, 10);
});
test("summary", async () => {
  const { createAccount } = await get();
  const acc = createAccount("עומר");
  assert.equal(acc.summary(), "עומר: ₪0.00");
  acc.deposit(120.5);
  assert.equal(acc.summary(), "עומר: ₪120.50");
});
test("לכל חשבון יתרה משלו", async () => {
  const { createAccount } = await get();
  const a = createAccount("a");
  const b = createAccount("b");
  a.deposit(50);
  assert.equal(b.balance, 0);
});
