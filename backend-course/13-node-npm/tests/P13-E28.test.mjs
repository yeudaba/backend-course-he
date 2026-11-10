import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P13-E28.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["loadConfigs"])).loadConfigs;

function files(map) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p13-e28-"));
  const p = {};
  for (const [name, text] of Object.entries(map)) {
    p[name] = path.join(dir, name);
    fs.writeFileSync(p[name], text);
  }
  return p;
}

test("שני קבצים — המאוחר גובר", async () => {
  const loadConfigs = await get();
  const p = files({ "default.json": '{ "port": 3000, "logLevel": "info", "db": "dev" }', "local.json": '{ "logLevel": "debug" }' });
  assert.deepEqual(await loadConfigs([p["default.json"], p["local.json"]]), { port: 3000, logLevel: "debug", db: "dev" });
  assert.deepEqual(await loadConfigs([p["local.json"], p["default.json"]]), { port: 3000, logLevel: "info", db: "dev" }, "כשהסדר הפוך — default.json גובר");
});
test("שלושה קבצים, ומערך ריק", async () => {
  const loadConfigs = await get();
  const p = files({ "a.json": '{ "x": 1, "y": 1, "z": 1 }', "b.json": '{ "y": 2 }', "c.json": '{ "z": 3 }' });
  assert.deepEqual(await loadConfigs([p["a.json"], p["b.json"], p["c.json"]]), { x: 1, y: 2, z: 3 });
  assert.deepEqual(await loadConfigs([]), {});
});
test("JSON לא תקין — שם הקובץ בהודעה", async () => {
  const loadConfigs = await get();
  const p = files({ "ok.json": "{}", "broken.json": "{ port: 1 }" });
  await assert.rejects(loadConfigs([p["ok.json"], p["broken.json"]]), { message: "broken.json: JSON לא תקין" });
});
test("קובץ חסר — השגיאה המקורית (ENOENT)", async () => {
  const loadConfigs = await get();
  const p = files({ "ok.json": "{}" });
  await assert.rejects(loadConfigs([p["ok.json"], path.join(path.dirname(p["ok.json"]), "missing.json")]), (err) => {
    assert.equal(err.code, "ENOENT", `קובץ חסר צריך להחזיר את השגיאה של readFile (ENOENT), וקיבלנו: ${err.message}. ה־try צריך לעטוף רק את JSON.parse`);
    return true;
  });
});
test("במקביל: Promise.all", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /Promise\.all\s*\(/, "התרגיל מתרגל Promise.all (פרק 10): קוראים את כל הקבצים במקביל");
  assert.match(src, /\.reduce\s*\(/, "התרגיל מתרגל reduce (פרק 6) למיזוג");
});
