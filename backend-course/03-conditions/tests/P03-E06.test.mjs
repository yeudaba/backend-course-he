import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E06.js";
const withRequest = (v) => run(import.meta.url, FILE, { changes: [[/(requestedInput\s*=\s*)(["'`])\d+\2/, `$1"${v}"`, 'את const requestedInput = "12"']] });

test('ביקשו "12", במלאי 9', () => {
  sameOutput(run(import.meta.url, FILE), ["ביקשו: 12, במלאי: 9", "יש מספיק? false", "חסרות: 3"]);
});

test('ביקשו "9" — בדיוק מספיק', () => {
  sameOutput(withRequest(9), ["ביקשו: 9, במלאי: 9", "יש מספיק? true", "חסרות: 0"]);
});

test('ביקשו "5" — "חסרות" לא יוצא שלילי', () => {
  sameOutput(withRequest(5), ["ביקשו: 5, במלאי: 9", "יש מספיק? true", "חסרות: 0"]);
});
