import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P03-E21-logic.js";

const cases = [
  ["viewer", 17, false],
  ["viewer", 30, false],
  ["guest", 40, false],
  ["admin", 30, true],
  ["owner", 45, true],
  ["admin", 17, false],
  ["owner", 5, false],
];

for (const [role, age, ok] of cases) {
  test(`תפקיד ${role}, גיל ${age} ← ${ok}`, () => {
    const r = run(import.meta.url, FILE, {
      changes: [
        ['"viewer"', `"${role}"`, 'את התפקיד "viewer"'],
        [/age = 17\b/, `age = ${age}`, "את השורה age = 17"],
      ],
    });
    sameOutput(r, [`מותר לצפות? ${ok}`]);
  });
}
