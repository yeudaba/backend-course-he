import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf, code } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E54.ts";
const mod = () => exportsOf(import.meta.url, FILE, ["InsufficientFundsError", "AccountNotFoundError", "Bank", "createApp"]);
async function start(t, balances) {
  const { Bank, createApp } = await mod();
  const { base, close } = await listen(createApp(new Bank(balances)));
  t.after(close);
  const call = api(base);
  return (id, amount) => call("POST", `/accounts/${id}/withdraw`, { amount });
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("Bank לבד — בלי HTTP", async () => {
  const { Bank, InsufficientFundsError, AccountNotFoundError } = await mod();
  const balances = new Map([["A1", 500]]);
  const bank = new Bank(balances);
  assert.equal(bank.withdraw("A1", 200), 300);
  assert.equal(balances.get("A1"), 300, "היתרה מתעדכנת ב־Map");
  assert.throws(() => bank.withdraw("A1", 301), (e) => e instanceof InsufficientFundsError && e.message === "אין מספיק כסף: יתרה 300, ביקשת 301");
  assert.throws(() => bank.withdraw("Z9", 1), (e) => e instanceof AccountNotFoundError && e.message === "חשבון Z9 לא קיים");
  assert.equal(bank.withdraw("A1", 300), 0, "אפשר למשוך את כל היתרה");
  assert.doesNotMatch(code(import.meta.url, FILE).match(/class Bank[\s\S]*?\n\}/)?.[0] ?? "", /status|res\.|HttpError/, "Bank לא יודע על HTTP");
});
test("דרך HTTP", async (t) => {
  const withdraw = await start(t, new Map([["A1", 500], ["B2", 10]]));
  let r = await withdraw("A1", 200);
  assert.deepEqual([r.status, r.body], [200, { id: "A1", balance: 300 }]);
  r = await withdraw("A1", 400);
  assert.deepEqual([r.status, r.body], [409, { error: { code: "INSUFFICIENT_FUNDS", message: "אין מספיק כסף: יתרה 300, ביקשת 400" } }]);
  r = await withdraw("C3", 1);
  assert.deepEqual([r.status, r.body], [404, { error: { code: "ACCOUNT_NOT_FOUND", message: "חשבון C3 לא קיים" } }]);
  r = await withdraw("B2", 10);
  assert.deepEqual(r.body, { id: "B2", balance: 0 });
});
test("amount לא תקין ← 400 VALIDATION", async (t) => {
  const withdraw = await start(t, new Map([["A1", 500]]));
  for (const amount of ["10", 0, -5, 1.5, null, undefined]) {
    const r = await withdraw("A1", amount);
    assert.equal(r.status, 400, `amount: ${JSON.stringify(amount)}`);
    assert.equal(r.body?.error?.code, "VALIDATION");
  }
});
test("שגיאה אחרת ← 500 בלי פרטים", async (t) => {
  const { createApp } = await mod();
  const broken = { withdraw() { throw new Error("connect ECONNREFUSED 10.0.0.5"); } };
  const orig = console.error;
  console.error = () => {};
  t.after(() => { console.error = orig; });
  const { base, close } = await listen(createApp(broken));
  t.after(close);
  const r = await api(base)("POST", "/accounts/A1/withdraw", { amount: 1 });
  assert.deepEqual([r.status, r.body], [500, { error: { code: "INTERNAL", message: "שגיאה פנימית" } }]);
});
