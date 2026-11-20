import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E83.js";
const out = (stock, id, adult, name) => [`מספיק במלאי? ${stock}`, `אותו מזהה? ${id}`, `בגיר? ${adult}`, `שם תואם? ${name}`];
const change = {
  stock: (n) => [/(stock\s*=\s*)5\b/, `$1${n}`, "את השורה const stock = 5;"],
  id: (s) => [/(idFromUrl\s*=\s*)"42"/, `$1"${s}"`, 'את השורה const idFromUrl = "42";'],
  age: (s) => [/(ageInput\s*=\s*)"9"/, `$1"${s}"`, 'את השורה const ageInput = "9";'],
  name: (s) => [/(nameInput\s*=\s*)"Dana "/, `$1"${s}"`, 'את השורה const nameInput = "Dana ";'],
};
const ok = (lines, ...changes) => sameOutput(run(import.meta.url, FILE, { changes }), lines);

test("הפלט הרצוי עם הערכים שבקובץ", () => ok(out(true, true, false, true)));
test("מלאי 6 מול הזמנה של 5 — מספיק", () => ok(out(true, true, false, true), change.stock(6)));
test("מלאי 4 מול הזמנה של 5 — לא מספיק", () => ok(out(false, true, false, true), change.stock(4)));
test('מזהה "43" — לא אותו מזהה', () => ok(out(true, false, false, true), change.id("43")));
test('גיל "18" בדיוק — בגיר', () => ok(out(true, true, true, true), change.age("18")));
test('גיל "17" — לא בגיר', () => ok(out(true, true, false, true), change.age("17")));
test('גיל "100" — בגיר (והשוואת טקסט הייתה אומרת לא)', () => ok(out(true, true, true, true), change.age("100")));
test('שם " DANA " — תואם אחרי ניקוי', () => ok(out(true, true, false, true), change.name(" DANA ")));
test('שם "Dina" — לא תואם', () => ok(out(true, true, false, false), change.name("Dina")));
