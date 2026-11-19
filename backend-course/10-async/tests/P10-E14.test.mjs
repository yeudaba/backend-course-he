import { test } from "node:test";
import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import { load } from "../../tools/load.mjs";

// readFile של fs/promises עטוף לפני שהקובץ שלך נטען: סופר כמה קריאות פתוחות בו־זמנית (כדי לבדוק "במקביל")
let active = 0;
let peak = 0;
const realReadFile = fsp.readFile;
fsp.readFile = async (...args) => {
  active++;
  peak = Math.max(peak, active);
  try {
    await new Promise((r) => setTimeout(r, 20));
    return await realReadFile(...args);
  } finally {
    active--;
  }
};
const { lineCounts, countLines } = await load(import.meta.url, "P10-E14.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("countLines", () => { assert.equal(countLines("a\nb\n"), 2); assert.equal(countLines("a"), 1); assert.equal(countLines(""), 0); assert.equal(countLines("a\n\nb"), 3); });
test("lineCounts", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e14-"));
  fs.writeFileSync(path.join(dir, "a.txt"), "1\n2\n3\n");
  fs.writeFileSync(path.join(dir, "b.txt"), "");
  fs.writeFileSync(path.join(dir, "c.md"), "ignored");
  assert.deepEqual(await lineCounts(dir), { "a.txt": 3, "b.txt": 0 });
});
test("lineCounts קוראת את הקבצים במקביל (fs/promises ו־Promise.all)", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e14-"));
  for (const n of ["x", "y", "z", "w"]) fs.writeFileSync(path.join(dir, `${n}.txt`), "1\n2\n");
  peak = 0;
  assert.deepEqual(await lineCounts(dir), { "w.txt": 2, "x.txt": 2, "y.txt": 2, "z.txt": 2 });
  assert.ok(peak >= 4, peak === 0 ? "הקבצים לא נקראו עם readFile של fs/promises (readFileSync חוסם — המשימה: במקביל)" : `לכל היותר ${peak} קריאות היו פתוחות בו־זמנית — הקבצים נקראו אחד־אחד (await בתוך לולאה). התחל את כל הקריאות ואז Promise.all`);
});
