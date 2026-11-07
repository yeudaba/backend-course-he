import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { bankError, deposit, withdraw, transfer, safeTransfer } = await load(import.meta.url, "P08-E24.js");

const a = () => ({ id: 1, owner: "דנה", balance: 100 });
const b = () => ({ id: 2, owner: "עומר", balance: 20 });
test("bankError", () => { const e = bankError("X", "m"); assert.ok(e instanceof Error); assert.equal(e.code, "X"); assert.equal(e.message, "m"); });
test("deposit / withdraw", () => {
  const acc = a();
  assert.equal(deposit(acc, 50).balance, 150);
  assert.equal(withdraw(acc, 30).balance, 70);
  assert.equal(acc.balance, 100);
});
test("סכומים לא תקינים", () => {
  for (const amt of [0, -5, "10", NaN]) assert.throws(() => deposit(a(), amt), { code: "INVALID_AMOUNT", message: "סכום לא תקין" });
});
test("אין מספיק יתרה", () => assert.throws(() => withdraw(b(), 50), { code: "INSUFFICIENT_FUNDS", message: "אין מספיק יתרה" }));
test("transfer", () => {
  const [f, t] = transfer(a(), b(), 30);
  assert.equal(f.balance, 70);
  assert.equal(t.balance, 50);
  assert.throws(() => transfer(a(), a(), 10), { code: "SAME_ACCOUNT" });
});
test("safeTransfer", () => {
  const from = a(), to = b();
  const r = safeTransfer(from, to, 500);
  assert.equal(r.ok, false);
  assert.equal(r.code, "INSUFFICIENT_FUNDS");
  assert.equal(r.from, from);
  assert.equal(r.to, to);
  assert.equal(safeTransfer(from, to, 10).to.balance, 30);
});
