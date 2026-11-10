import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E26.js";
const withGoal = (n) => run(import.meta.url, FILE, { changes: [[/(goal\s*=\s*)100\b/, `$1${n}`, "את השורה const goal = 100;"]] });

test("יעד 100", () => sameOutput(run(import.meta.url, FILE), ["הגענו ל־105 אחרי 14 מספרים"]));
test("יעד 10 — בדיוק 1+2+3+4", () => sameOutput(withGoal(10), ["הגענו ל־10 אחרי 4 מספרים"]));
test("יעד 1000", () => sameOutput(withGoal(1000), ["הגענו ל־1035 אחרי 45 מספרים"]));

test("עם while", () => {
  assert.match(code(source(import.meta.url, FILE)), /while\s*\(/, "לא יודעים מראש כמה סיבובים — זה תפקיד של while");
});
