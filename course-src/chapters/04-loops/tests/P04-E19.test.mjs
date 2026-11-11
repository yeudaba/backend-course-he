import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E19.js";
const withInput = (t) => run(import.meta.url, FILE, { changes: [[/(input\s*=\s*)(["'`]).*?\2/, `$1"${t}"`, "את השורה const input = ...;"]] });

test("המשפט מהתרגיל", () => sameOutput(run(import.meta.url, FILE), ["[Learn Node And Express]"]));
test("אותיות גדולות באמצע מילה הופכות לקטנות", () => sameOutput(withInput("  hello   WORLD  "), ["[Hello World]"]));
test("מילה אחת", () => sameOutput(withInput("backend"), ["[Backend]"]));

test("בלי split", () => {
  assert.ok(!code(source(import.meta.url, FILE)).includes(".split("), "התרגיל מתרגל לולאה ודגל — בלי split");
});
