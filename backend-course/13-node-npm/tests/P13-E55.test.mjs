import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E55.mjs", ["countItems"])).countItems;
const files = { "a.json": "[1, 2, 3]", "empty.json": "[]", "obj.json": '{"x": 1}', "bad.json": "[1, 2" };
function io() {
  const out = [];
  const err = [];
  const reads = [];
  return {
    out, err, reads,
    io: {
      log: (m) => out.push(m),
      error: (m) => err.push(m),
      readFile: async (file, enc) => {
        reads.push([file, enc]);
        if (file === "locked.json") throw Object.assign(new Error("EACCES: permission denied"), { code: "EACCES" });
        if (!(file in files)) throw Object.assign(new Error(`ENOENT: ${file}`), { code: "ENOENT" });
        return files[file];
      },
    },
  };
}

test("הצלחה", async () => {
  const countItems = await get();
  const t = io();
  assert.equal(await countItems(["a.json"], t.io), 0);
  assert.deepEqual(t.out, ["a.json: 3 פריטים"]);
  assert.deepEqual(t.reads, [["a.json", "utf8"]], "קוראים עם readFile(file, \"utf8\") שקיבלת");
  const t2 = io();
  assert.equal(await countItems(["empty.json"], t2.io), 0);
  assert.deepEqual(t2.out, ["empty.json: 0 פריטים"]);
});
test("שימוש שגוי ← 2", async () => {
  const countItems = await get();
  for (const args of [[], ["a.json", "b.json"]]) {
    const t = io();
    assert.equal(await countItems(args, t.io), 2);
    assert.deepEqual(t.err, ["שימוש: count <file>"]);
    assert.deepEqual(t.reads, [], "בשימוש שגוי לא קוראים קבצים");
  }
});
test("קובץ חסר / לא מערך ← 1", async () => {
  const countItems = await get();
  for (const [file, msg] of [["nope.json", "הקובץ לא נמצא: nope.json"], ["obj.json", "obj.json: צריך מערך JSON"], ["bad.json", "bad.json: צריך מערך JSON"]]) {
    const t = io();
    assert.equal(await countItems([file], t.io), 1, file);
    assert.deepEqual(t.err, [msg]);
    assert.deepEqual(t.out, []);
  }
});
test("שגיאה אחרת נזרקת הלאה", async () => {
  const countItems = await get();
  await assert.rejects(countItems(["locked.json"], io().io), (e) => e.code === "EACCES", "שגיאה לא צפויה לא הופכת לקוד 1");
});
