import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P05-E27.js", ["statusText"]);

test("חמשת הקודים המוכרים", async () => {
  const { statusText } = await get();
  assert.equal(statusText(200), "OK");
  assert.equal(statusText(201), "Created");
  assert.equal(statusText(400), "Bad Request");
  assert.equal(statusText(404), "Not Found");
  assert.equal(statusText(500), "Internal Server Error");
});
test("כל דבר אחר — Unknown", async () => {
  const { statusText } = await get();
  assert.equal(statusText(418), "Unknown");
  assert.equal(statusText(0), "Unknown");
  assert.equal(statusText(undefined), "Unknown", "בלי ארגומנט");
  assert.equal(statusText("200"), "Unknown", 'המחרוזת "200" אינה המספר 200 (switch משווה עם ===)');
});
test("משתמש ב־switch", () => {
  assert.match(code(import.meta.url, "P05-E27.js"), /switch\s*\(/, "התרגיל מתרגל switch (פרק 3) — נסה בלי if");
});
