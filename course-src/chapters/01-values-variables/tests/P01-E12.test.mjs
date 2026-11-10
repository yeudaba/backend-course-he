import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code, strings } from "./_out.mjs";

const FILE = "P01-E12.js";

test("הפלט זהה לפלט הרצוי", () => {
  sameOutput(run(import.meta.url, FILE), ["שם: תמר", "טלפון: null", "יש טלפון? false"]);
});

test("phone מקבל את הערך null (ולא את המחרוזת \"null\")", () => {
  const src = source(import.meta.url, FILE);
  assert.match(code(src), /phone\s*=\s*null\b/, "הגדר const phone = null;");
  assert.ok(!strings(src).some((s) => s.includes("null")), "המילה null כתובה בתוך מירכאות — זו מחרוזת, לא הערך null");
});
