import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, source, code } from "./_out.mjs";

const FILE = "P04-E15.js";

test("הראשוניים עד 50", () => sameOutput(run(import.meta.url, FILE), ["2 3 5 7 11 13 17 19 23 29 31 37 41 43 47", "כמות: 15"]));

test("מחושב עם לולאות, דגל ו־break", () => {
  const src = code(source(import.meta.url, FILE));
  assert.ok((src.match(/\bfor\s*\(|\bwhile\s*\(/g)?.length ?? 0) >= 2, "צריך לולאה חיצונית ולולאה פנימית");
  assert.match(src, /\bbreak\b/, "השתמש ב־break כשנמצא מחלק");
  assert.ok(!/\b47\b|\b43\b/.test(src), "המספרים הראשוניים כתובים בקוד — הם צריכים להיות מחושבים");
});
