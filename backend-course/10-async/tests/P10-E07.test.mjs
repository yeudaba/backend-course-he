import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { readJson } = await load(import.meta.url, "P10-E07.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e07-"));
const call = (file) => new Promise((resolve) => { let n = 0; readJson(file, (err, data) => { n++; setTimeout(() => resolve({ err, data, n }), 20); }); });
test("קובץ תקין", async () => { const f = path.join(dir, "a.json"); fs.writeFileSync(f, '{"a":1}'); const r = await call(f); assert.equal(r.err, null); assert.deepEqual(r.data, { a: 1 }); assert.equal(r.n, 1); });
test("קובץ לא קיים", async () => { const r = await call(path.join(dir, "none.json")); assert.equal(r.err.code, "ENOENT"); assert.equal(r.n, 1); });
test("JSON פגום", async () => { const f = path.join(dir, "b.json"); fs.writeFileSync(f, "{oops"); const r = await call(f); assert.ok(r.err instanceof SyntaxError); assert.equal(r.n, 1); });
