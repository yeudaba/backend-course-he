import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E67.js", ["readJson"]);
const t = tmpFiles({ "a.json": '{"port": 8080, "tags": ["x"]}', "bad.json": "{port: 8080}", "n.json": "42" });

test("מחזירה את האובייקט", async () => {
  const { readJson } = await get();
  const p = readJson(t.p("a.json"));
  assert.ok(p instanceof Promise, "readJson צריכה להחזיר Promise");
  assert.deepEqual(await p, { port: 8080, tags: ["x"] });
  assert.equal(await readJson(t.p("n.json")), 42);
});
test("JSON לא תקין ← הודעה עם שם הקובץ", async () => {
  const { readJson } = await get();
  await assert.rejects(readJson(t.p("bad.json")), { message: `JSON לא תקין ב־${t.p("bad.json")}` });
});
test("קובץ שלא קיים ← השגיאה המקורית", async () => {
  const { readJson } = await get();
  await assert.rejects(readJson(t.p("nope.json")), (e) => e.code === "ENOENT", "שגיאת הקריאה צריכה לעבור כמו שהיא (עם code)");
});
test("then בלבד", () => {
  const src = code(import.meta.url, "P10-E67.js");
  assert.ok(!/\bawait\b|\basync\b/.test(src), "בתרגיל הזה — then/catch בלבד, בלי async/await");
});
