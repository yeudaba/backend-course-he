import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E54.js", ["readText", "readUpper"]);
const t = tmpFiles({ "h.txt": "hello", "m.txt": "Mixed Case 1\nשלום" });

test("readText מחזירה Promise עם התוכן", async () => {
  const { readText } = await get();
  const p = readText(t.p("h.txt"));
  assert.ok(p instanceof Promise, "readText צריכה להחזיר Promise (return new Promise(...))");
  assert.equal(await p, "hello");
  assert.equal(await readText(t.p("m.txt")), "Mixed Case 1\nשלום");
});
test("readText נכשלת עם השגיאה המקורית", async () => {
  const { readText } = await get();
  await assert.rejects(readText(t.p("nope.txt")), (err) => err.code === "ENOENT");
});
test("readUpper", async () => {
  const { readUpper } = await get();
  const p = readUpper(t.p("m.txt"));
  assert.ok(p instanceof Promise, "readUpper צריכה להחזיר Promise — return readText(...).then(...)");
  assert.equal(await p, "MIXED CASE 1\nשלום");
  await assert.rejects(readUpper(t.p("nope.txt")), (err) => err.code === "ENOENT");
});
test("עוטפים את fs.readFile (לא fs/promises)", () => {
  const src = code(import.meta.url, "P10-E54.js");
  assert.ok(/new Promise/.test(src), "המשימה: לעטוף בעצמך עם new Promise");
  assert.ok(!/fs\/promises|readFileSync/.test(src), "בלי fs/promises ובלי readFileSync — עוטפים את fs.readFile");
});
