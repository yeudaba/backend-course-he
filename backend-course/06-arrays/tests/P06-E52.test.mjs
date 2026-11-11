import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E52.js";
const get = () => exportsOf(import.meta.url, FILE, ["acronym"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ראשי תיבות", async () => {
  const { acronym } = await get();
  assert.equal(acronym("Hyper Text Markup Language"), "HTML");
  assert.equal(acronym("application programming interface"), "API");
  assert.equal(acronym("node"), "N");
});
test("רווחים כפולים ובקצוות", async () => {
  const { acronym } = await get();
  assert.equal(acronym("  as soon   as possible "), "ASAP");
  assert.equal(acronym("   "), "");
  assert.equal(acronym(""), "");
});
