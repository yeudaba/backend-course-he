import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { slowSquareRoot } = await load(import.meta.url, "P10-E10.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("שורש", async () => { assert.equal(await slowSquareRoot(81), 9); assert.equal(await slowSquareRoot(0, 1), 0); });
test("שלילי", async () => assert.rejects(slowSquareRoot(-4), { message: "אין שורש למספר שלילי" }));
test("לא מספר", async () => { await assert.rejects(slowSquareRoot("9"), { message: "לא מספר" }); await assert.rejects(slowSquareRoot(NaN), { message: "לא מספר" }); });
test("מחכה ms", async () => { const t = Date.now(); await slowSquareRoot(4, 40); assert.ok(Date.now() - t >= 35); });
