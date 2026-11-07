// P22-E20 — מתוקן
import { test } from "node:test";
import assert from "node:assert/strict";
import { InsufficientFundsError, lowBalance, transfer } from "./P22-E20.ts";

test("העברה מעדכנת את שני החשבונות", async () => {
  const accounts = new Map([["a", 100], ["b", 0]]);
  await transfer(accounts, "a", "b", 30);
  assert.deepEqual(accounts, new Map([["a", 70], ["b", 30]])); // ← היה: השוואה לאותו אובייקט בדיוק
});

test("אין מספיק כסף — נזרק, ושום דבר לא השתנה", async () => {
  const accounts = new Map([["a", 10], ["b", 0]]);
  await assert.rejects(transfer(accounts, "a", "b", 50), InsufficientFundsError); // ← היה: try/catch שעובר גם בלי שגיאה
  assert.deepEqual(accounts, new Map([["a", 10], ["b", 0]]));
});

test("סכום שלילי או אפס", async () => {
  for (const amount of [-5, 0]) {
    await assert.rejects(transfer(new Map([["a", 10], ["b", 0]]), "a", "b", amount), RangeError);
  }
});

test("lowBalance — בדיוק החשבונות שמתחת לסף", () => {
  const accounts = new Map([["a", 5], ["b", 50], ["c", 10]]);
  assert.deepEqual(lowBalance(accounts, 10), ["a"]); // ← היה: לולאה על התוצאה — על רשימה ריקה היא לא בודקת כלום
});
