import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { safeJoin } = await load(import.meta.url, "P13-E11.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("בתוך התיקייה", () => { assert.equal(safeJoin("/srv/uploads", "a/b.png"), "/srv/uploads/a/b.png"); assert.equal(safeJoin("/srv/uploads", "a/../b.png"), "/srv/uploads/b.png"); });
test("יציאה מהתיקייה", () => { for (const p of ["../x", "a/../../x", "/etc/passwd", "../uploads-old/x"]) assert.throws(() => safeJoin("/srv/uploads", p), { message: "נתיב לא מורשה" }); });
