import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E28.js";

test("מ־‎-10 עד 40 בקפיצות של 10", () => {
  sameOutput(run(import.meta.url, FILE), [
    "-10°C =  14.0°F (קר)",
    "  0°C =  32.0°F (קר)",
    " 10°C =  50.0°F (נעים)",
    " 20°C =  68.0°F (נעים)",
    " 30°C =  86.0°F (חם)",
    " 40°C = 104.0°F (חם)",
  ]);
});

test("מ־0 עד 30 בקפיצות של 15", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(const\s+from\s*=\s*)-10\b/, "$10", "את השורה const from = -10;"],
      [/(const\s+to\s*=\s*)40\b/, "$130", "את השורה const to = 40;"],
      [/(const\s+step\s*=\s*)10\b/, "$115", "את השורה const step = 10;"],
    ],
  });
  sameOutput(r, ["  0°C =  32.0°F (קר)", " 15°C =  59.0°F (נעים)", " 30°C =  86.0°F (חם)"]);
});

test("הגבולות: 25 עדיין נעים, 26 כבר חם", () => {
  const r = run(import.meta.url, FILE, {
    changes: [
      [/(const\s+from\s*=\s*)-10\b/, "$125", "את השורה const from = -10;"],
      [/(const\s+to\s*=\s*)40\b/, "$126", "את השורה const to = 40;"],
      [/(const\s+step\s*=\s*)10\b/, "$11", "את השורה const step = 10;"],
    ],
  });
  sameOutput(r, [" 25°C =  77.0°F (נעים)", " 26°C =  78.8°F (חם)"]);
});

test("היישור עם padStart והעיגול עם toFixed (חזרה על פרק 2)", () => {
  const src = code(source(import.meta.url, FILE));
  assert.match(src, /padStart\(/, "יישור — padStart");
  assert.match(src, /toFixed\(1\)/, "ספרה אחת אחרי הנקודה — toFixed(1)");
});
