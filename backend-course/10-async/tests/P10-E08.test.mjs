import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { getPrice } = await load(import.meta.url, "P10-E08.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("מחזירה Promise", () => assert.ok(getPrice("KB-101") instanceof Promise));
test("הצלחה", async () => assert.equal(await getPrice("MS-201"), 89));
test("כישלון", async () => assert.rejects(getPrice("X"), { message: "אין מחיר ל־X" }));
