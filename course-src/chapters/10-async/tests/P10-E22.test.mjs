import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { totalStock } = await load(import.meta.url, "P10-E22.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("סכום נכון", async () => assert.equal(await totalStock(["a", "bb", "ccc"], (c) => sleep(10, c.length)), 6));
test("במקביל", async () => { const t = Date.now(); await totalStock(["a", "b", "c", "d"], () => sleep(40, 1)); assert.ok(Date.now() - t < 120); });
