import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { createAutocomplete } = await load(import.meta.url, "P27-E25.ts");

test("השלמה לפי משקל, ואז אלפביתי", () => {
  const ac = createAutocomplete();
  ac.add("latte", 5);
  ac.add("lavender tea", 2);
  ac.add("lemonade", 3);
  ac.add("latte macchiato", 2);
  ac.add("espresso", 9);
  assert.deepEqual(ac.suggest("la"), ["latte", "latte macchiato", "lavender tea"]);
  assert.deepEqual(ac.suggest("l", 2), ["latte", "lemonade"]);
  assert.deepEqual(ac.suggest("x"), []);
  assert.equal(ac.size, 5);
});
test("add מצטבר; בלי הבדל רישיות; הכתיב הראשון נשמר", () => {
  const ac = createAutocomplete();
  ac.add("Mocha");
  ac.add("matcha", 2);
  ac.add("mocha", 2);
  assert.deepEqual(ac.suggest("M"), ["Mocha", "matcha"], "mocha: 1+2=3 > matcha: 2");
  assert.equal(ac.size, 2);
  assert.deepEqual(ac.suggest(""), ["Mocha", "matcha"], "prefix ריק — הכי פופולריים בכלל");
});
test("משקל שעולה — מקדם מונח גם אם קודם לא היה בין המובילים", () => {
  const ac = createAutocomplete();
  for (let i = 0; i < 20; i++) ac.add(`cap${String(i).padStart(2, "0")}`, 10);
  ac.add("cap19", 5);
  assert.equal(ac.suggest("cap", 1)[0], "cap19");
});
test("50,000 מונחים ו־20,000 השלמות — מהר", () => {
  const rnd = seeded(11);
  const letters = "abcdefghij";
  const word = () => Array.from({ length: 6 + Math.floor(rnd() * 6) }, () => letters[Math.floor(rnd() * 10)]).join("");
  const ac = createAutocomplete();
  const words = Array.from({ length: 50_000 }, word);
  for (const w of words) ac.add(w, 1 + Math.floor(rnd() * 100));
  fastEnough(() => {
    for (let i = 0; i < 20_000; i++) ac.suggest(words[i].slice(0, 3), 5);
  }, 600, "20,000 קריאות ל־suggest");
});
