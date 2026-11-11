import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E18.js";
const withText = (t) => run(import.meta.url, FILE, { changes: [[/(text\s*=\s*)(["'`]).*?\2/, `$1"${t}"`, "את השורה const text = ...;"]] });

test("Was it a car or a cat I saw — פלינדרום (בשני הפתרונות)", () => sameOutput(run(import.meta.url, FILE), ["פלינדרום? true", "פלינדרום? true"]));
test("Hello — לא פלינדרום", () => sameOutput(withText("Hello"), ["פלינדרום? false", "פלינדרום? false"]));
test("מחרוזת ריקה — פלינדרום", () => sameOutput(withText(""), ["פלינדרום? true", "פלינדרום? true"]));
test("Never odd or even — פלינדרום", () => sameOutput(withText("Never odd or even"), ["פלינדרום? true", "פלינדרום? true"]));
test("abca — שונה רק באמצע", () => sameOutput(withText("abca"), ["פלינדרום? false", "פלינדרום? false"]));

test("פתרון 2 עוצר עם break", () => {
  assert.match(code(source(import.meta.url, FILE)), /\bbreak\b/, "בפתרון 2 עוצרים בתו הראשון שלא תואם");
});
