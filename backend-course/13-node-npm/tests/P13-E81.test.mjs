import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { target } from "../../tools/load.mjs";

function pkg() {
  const text = readFileSync(target(import.meta.url, "P13-E81-package.json"), "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    assert.fail(`הקובץ עדיין לא JSON תקין: ${err.message}`);
  }
}

test("JSON תקין", () => {
  pkg();
});
test("ESM: type module", () => {
  assert.equal(pkg().type, "module", 'חסר "type": "module" — בלי זה import בקובצי .js לא עובד');
});
test("scripts: start ו־test", () => {
  const p = pkg();
  assert.equal(p.scripts?.start, "node src/server.js", "npm start מחפש scripts.start");
  assert.equal(p.scripts?.test, "node --test");
});
test("תלויות בחלק הנכון, בלי לשנות גרסאות", () => {
  const p = pkg();
  assert.deepEqual(p.dependencies, { express: "^5.1.0", zod: "^4.1.5" }, "express ו־zod — בזמן ריצה (dependencies), עם אותם טווחים");
  assert.deepEqual(p.devDependencies, { eslint: "^9.39.0" }, "eslint — רק בפיתוח (devDependencies)");
  assert.equal(p.name, "coffee-api");
  assert.equal(p.version, "1.0.0");
});
