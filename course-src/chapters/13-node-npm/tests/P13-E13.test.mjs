import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { compareVersions, satisfies, maxSatisfying } = await load(import.meta.url, "P13-E13.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("compareVersions", () => { assert.ok(compareVersions("1.10.0", "1.9.0") > 0); assert.equal(compareVersions("2.0.0", "2.0.0"), 0); assert.deepEqual(["1.10.0", "1.2.0", "1.9.9"].sort(compareVersions), ["1.2.0", "1.9.9", "1.10.0"]); });
test("satisfies", () => { assert.equal(satisfies("4.21.0", "^4.18.0"), true); assert.equal(satisfies("4.19.0", "~4.18.0"), false); assert.equal(satisfies("4.18.5", "~4.18.0"), true); assert.equal(satisfies("1.2.3", "1.2.3"), true); assert.equal(satisfies("1.2.4", "1.2.3"), false); });
test("maxSatisfying", () => { const a = ["4.17.1", "4.18.2", "4.21.0", "5.0.0"]; assert.equal(maxSatisfying(a, "^4.18.0"), "4.21.0"); assert.equal(maxSatisfying(a, "~4.18.0"), "4.18.2"); assert.equal(maxSatisfying(a, "^6.0.0"), null); });
