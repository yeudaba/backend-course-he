// P22-E20: הבדיקות האלה ירוקות — גם כשהקוד שבור. מצא למה, ותקן את הבדיקות (לא את הקוד)
import { test } from "node:test";
import assert from "node:assert/strict";
import { InsufficientFundsError, lowBalance, transfer } from "./P22-E20.ts";

test("העברה מעדכנת את שני החשבונות", async () => {
  const accounts = new Map([["a", 100], ["b", 0]]);
  const before = accounts;
  await transfer(accounts, "a", "b", 30);
  assert.deepEqual(accounts, before);
});

test("אין מספיק כסף", async () => {
  const accounts = new Map([["a", 10], ["b", 0]]);
  try {
    await transfer(accounts, "a", "b", 50);
  } catch (err) {
    assert.ok(err instanceof InsufficientFundsError);
  }
});

test("סכום שלילי", async () => {
  try {
    await transfer(new Map([["a", 10], ["b", 0]]), "a", "b", -5);
  } catch (err) {
    assert.ok(err instanceof RangeError);
  }
});

test("lowBalance — כל מה שמוחזר באמת מתחת לסף", () => {
  const accounts = new Map([["a", 5], ["b", 50], ["c", 10]]);
  for (const name of lowBalance(accounts, 10)) {
    assert.ok(accounts.get(name)! < 10);
  }
});
