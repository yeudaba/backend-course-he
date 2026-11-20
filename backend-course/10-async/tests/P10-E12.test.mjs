import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { inFlight, parallelMessage } from "./_par.mjs";

const { fetchAll } = await load(import.meta.url, "P10-E12.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("תוצאות בסדר המקורי", async () => {
  const r = await fetchAll([3, 1, 2], (id) => sleep(30 - id * 5, `user-${id}`));
  assert.deepEqual(r, ["user-3", "user-1", "user-2"]);
});
test("במקביל", async () => {
  const fetchOne = inFlight(() => sleep(30));
  await fetchAll([1, 2, 3, 4, 5], fetchOne.fn);
  assert.equal(fetchOne.max, 5, parallelMessage(fetchOne.max, 5));
});
test("כישלון אחד מכשיל", async () => assert.rejects(fetchAll([1, 2], (id) => (id === 2 ? failAfter(5, "x") : sleep(5))), { message: "x" }));
