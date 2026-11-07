import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { envInt, envBool } = await load(import.meta.url, "P13-E09.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("envInt", () => { assert.equal(envInt({ P: "8080" }, "P", 1), 8080); assert.equal(envInt({}, "P", 3000), 3000); assert.equal(envInt({ P: " " }, "P", 7), 7); assert.equal(envInt({ P: "-5" }, "P", 0), -5); assert.throws(() => envInt({ P: "80a" }, "P", 1), { message: "P חייב להיות מספר שלם" }); assert.throws(() => envInt({ P: "1.5" }, "P", 1)); });
test("envBool", () => { for (const v of ["true", "TRUE", "1", "yes", "On"]) assert.equal(envBool({ D: v }, "D", false), true); for (const v of ["false", "False", "0", "no", "off"]) assert.equal(envBool({ D: v }, "D", true), false); assert.equal(envBool({}, "D", true), true); assert.throws(() => envBool({ D: "maybe" }, "D", true), { message: "D חייב להיות בוליאני" }); });
