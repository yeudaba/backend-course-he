import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { inFlight, parallelMessage } from "./_par.mjs";

const { totalStock } = await load(import.meta.url, "P10-E22.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("סכום נכון", async () => assert.equal(await totalStock(["a", "bb", "ccc"], (c) => sleep(10, c.length)), 6));
test("במקביל", async () => {
  const getStock = inFlight(() => sleep(30, 1));
  assert.equal(await totalStock(["a", "b", "c", "d"], getStock.fn), 4);
  assert.equal(getStock.max, 4, parallelMessage(getStock.max, 4));
});
