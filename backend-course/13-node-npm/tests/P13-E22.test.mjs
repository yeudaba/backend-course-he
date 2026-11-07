import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { buildConfig } = await load(import.meta.url, "P13-E22.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("לא מדליף", () => { const logs = []; buildConfig({ DATABASE_URL: "postgres://u:pass@h/db", JWT_SECRET: "s3" }, (m) => logs.push(m)); assert.deepEqual(logs, ['config: {"port":3000,"databaseUrl":"***","jwtSecret":"***"}']); });
test("נכשל מוקדם", () => { assert.throws(() => buildConfig({ JWT_SECRET: "x" }, () => {}), { message: "חסר DATABASE_URL" }); assert.throws(() => buildConfig({ DATABASE_URL: "x" }, () => {}), { message: "חסר JWT_SECRET" }); });
test("מחזיר ערכים אמיתיים", () => assert.deepEqual(buildConfig({ DATABASE_URL: "d", JWT_SECRET: "j", PORT: "9" }, () => {}), { port: 9, databaseUrl: "d", jwtSecret: "j" }));
