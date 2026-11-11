import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, printed } from "./_out.mjs";

const FILE = "P04-E13.js";
const withStart = (n) => run(import.meta.url, FILE, { changes: [[/(start\s*=\s*)6\b/, `$1${n}`, "את השורה const start = 6;"]] });

test("start = 6", () => sameOutput(run(import.meta.url, FILE), ["6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1", "צעדים: 8"]));

test("start = 27 — 111 צעדים", () => {
  const r = withStart(27);
  printed(r);
  assert.ok(r.lines[0].startsWith("27 → 82 → 41 → "), "המסלול של 27 מתחיל ב־27 → 82 → 41");
  assert.ok(r.lines[0].endsWith(" → 4 → 2 → 1"), "המסלול נגמר ב־4 → 2 → 1");
  assert.equal(r.lines[1], "צעדים: 111");
});

test("start = 1 — אפס צעדים, בלי חץ מיותר", () => sameOutput(withStart(1), ["1", "צעדים: 0"]));
