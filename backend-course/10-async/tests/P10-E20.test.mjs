import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { loadSettings } = await load(import.meta.url, "P10-E20.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e20-"));
function call(file) {
  return new Promise((resolve) => {
    let n = 0; let last;
    const onUncaught = (e) => { last = { err: e, crashed: true }; };
    process.once("uncaughtException", onUncaught);
    loadSettings(file, (err, data) => { n++; last = { err, data }; });
    setTimeout(() => { process.removeListener("uncaughtException", onUncaught); resolve({ ...last, n }); }, 40);
  });
}
test("תקין", async () => { const f = path.join(dir, "s.json"); fs.writeFileSync(f, '{"lang":"he"}'); const r = await call(f); assert.equal(r.n, 1); assert.deepEqual(r.data, { theme: "light", lang: "he" }); });
test("קובץ חסר — callback אחד עם שגיאה, בלי קריסה", async () => { const r = await call(path.join(dir, "none.json")); assert.equal(r.crashed, undefined); assert.equal(r.n, 1); assert.equal(r.err.code, "ENOENT"); });
test("JSON פגום — callback עם שגיאה", async () => { const f = path.join(dir, "bad.json"); fs.writeFileSync(f, "{x"); const r = await call(f); assert.equal(r.crashed, undefined); assert.equal(r.n, 1); assert.ok(r.err instanceof SyntaxError); });
