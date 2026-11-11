import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P04-E11.js";
const withText = (t) => run(import.meta.url, FILE, { changes: [[/(text\s*=\s*)(["'`]).*?\2/, `$1"${t}"`, "את השורה const text = ...;"]] });

test("המשפט מהתרגיל", () => sameOutput(run(import.meta.url, FILE), ["תנועות: 11", "רווחים: 3"]));
test("אותיות גדולות נספרות גם הן", () => sameOutput(withText("AEIOU xyz"), ["תנועות: 5", "רווחים: 1"]));
test("משפט אחר", () => sameOutput(withText("Hello World Again"), ["תנועות: 6", "רווחים: 2"]));
