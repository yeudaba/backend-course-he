import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { parseVersion, satisfiesCaret } = await load(import.meta.url, "P13-E06.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("parseVersion", () => { assert.deepEqual(parseVersion("1.12.3"), [1, 12, 3]); for (const v of ["1.2", "1.2.x", "a.b.c", "1.2.3.4"]) assert.throws(() => parseVersion(v), { message: `גרסה לא תקינה: ${v}` }); });
test("satisfiesCaret", () => {
  assert.equal(satisfiesCaret("1.9.0", "^1.2.3"), true);
  assert.equal(satisfiesCaret("1.10.0", "^1.9.0"), true);
  assert.equal(satisfiesCaret("1.2.2", "^1.2.3"), false);
  assert.equal(satisfiesCaret("2.0.0", "^1.2.3"), false);
});
test("MAJOR 0", () => { assert.equal(satisfiesCaret("0.2.9", "^0.2.3"), true); assert.equal(satisfiesCaret("0.3.0", "^0.2.3"), false); });
