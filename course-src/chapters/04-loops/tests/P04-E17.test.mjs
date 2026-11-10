import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E17.js";

test("גדול מ־1000", () => sameOutput(run(import.meta.url, FILE), ["נמצא: 1001 אחרי 1 בדיקות"]));

test("גדול מ־1001 (start = 1002)", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(start\s*=\s*)1001\b/, "$11002", "את השורה const start = 1001;"]] });
  sameOutput(r, ["נמצא: 1092 אחרי 91 בדיקות"]);
});

test("עוצרים עם break", () => {
  assert.match(code(source(import.meta.url, FILE)), /\bbreak\b/, "התרגיל מתרגל break");
});
