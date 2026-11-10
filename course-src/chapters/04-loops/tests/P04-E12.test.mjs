import { test } from "node:test";
import assert from "node:assert/strict";
import { run, printed, source, code } from "./_out.mjs";

const FILE = "P04-E12.js";
const up = (h) => Array.from({ length: h }, (_, i) => "*".repeat(i + 1));

// המשולש הרגיל — ואם הוספת גם את ההפוך, הוא בא אחריו
function check(r, h) {
  printed(r);
  assert.deepEqual(r.lines.slice(0, h), up(h), `ציפינו למשולש בגובה ${h}`);
  if (r.lines.length > h) assert.deepEqual(r.lines.slice(h), up(h).reverse(), "אחרי המשולש — המשולש ההפוך (5 למעלה, 1 למטה)");
}

test("משולש בגובה 5", () => check(run(import.meta.url, FILE), 5));
test("משולש בגובה 3", () => check(run(import.meta.url, FILE, { changes: [[/(height\s*=\s*)5\b/, "$13", "את השורה const height = 5;"]] }), 3));

test("לולאה מקוננת (בלי repeat)", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok((src.match(/\bfor\s*\(|\bwhile\s*\(/g)?.length ?? 0) >= 2, "צריך לולאה בתוך לולאה");
  assert.ok(!src.includes(".repeat("), "התרגיל מתרגל קינון — בלי repeat");
});
