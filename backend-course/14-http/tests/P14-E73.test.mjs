import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { syncBuiltinESMExports } from "node:module";
import { exportsOf } from "./_src.mjs";

// readFile של fs/promises עטוף (לפני שהקובץ שלך נטען): סופר כמה קריאות פתוחות בו־זמנית — כדי לבדוק "במקביל"
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
// readdir מחזיר את השמות בסדר הפוך — כדי לוודא שהתוצאה ממוינת בקוד ולא "במקרה" לפי סדר מערכת הקבצים
const realReaddir = fsp.readdir;
fsp.readdir = async (...args) => {
  const names = await realReaddir(...args);
  return Array.isArray(names) ? [...names].sort().reverse() : names;
};
syncBuiltinESMExports();

const FILE = "P14-E73.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["summarizeHttpDir"])).summarizeHttpDir;

function dirWith(map) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p14-e73-"));
  for (const [name, text] of Object.entries(map)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), text);
  }
  return dir;
}

test("ספירת בקשות לפי method, ממוין לפי שם הקובץ", async () => {
  const summarizeHttpDir = await get();
  const dir = dirWith({
    "products.http": "### a\nGET http://x/products\n\n### b\nPOST http://x/products\nContent-Type: application/json\n\n{}\n\n### c\nGET http://x/products/1\n",
    "auth.http": "### login\nPOST http://x/login\n### out\nDELETE http://x/session\n",
    "notes.txt": "GET http://x/ignored\n",
    "empty.http": "### nothing here\n",
    "sub/deep.http": "GET http://x/deep\n",
  });
  assert.deepEqual(await summarizeHttpDir(dir), [
    { file: "auth.http", requests: 2, methods: { POST: 1, DELETE: 1 } },
    { file: "empty.http", requests: 0, methods: {} },
    { file: "products.http", requests: 3, methods: { GET: 2, POST: 1 } },
  ]);
});

test("רק שורות שמתחילות ב־METHOD ורווח", async () => {
  const summarizeHttpDir = await get();
  const dir = dirWith({ "a.http": "# GET in a comment\nGETTER http://x\n  GET http://x/indented\nPATCH http://x/1\r\nPUT http://x/2\r\nget http://x/lower\n" });
  assert.deepEqual(await summarizeHttpDir(dir), [{ file: "a.http", requests: 2, methods: { PATCH: 1, PUT: 1 } }]);
});

test("הקבצים נקראים במקביל", async () => {
  const summarizeHttpDir = await get();
  const dir = dirWith({ "1.http": "GET http://x\n", "2.http": "GET http://x\n", "3.http": "GET http://x\n" });
  peak = 0;
  assert.equal((await summarizeHttpDir(dir)).length, 3);
  assert.ok(peak >= 3, peak === 0 ? "הקבצים לא נקראו עם readFile של fs/promises" : `לכל היותר ${peak} קריאות היו פתוחות בו־זמנית — הקבצים נקראו אחד־אחד. map ואז Promise.all`);
});

test("תיקייה שלא קיימת", async () => {
  const summarizeHttpDir = await get();
  const dir = path.join(os.tmpdir(), `p14-e73-missing-${process.pid}`);
  await assert.rejects(summarizeHttpDir(dir), { message: `התיקייה לא קיימת: ${dir}` });
});
