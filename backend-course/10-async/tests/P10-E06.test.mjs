import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { delay, countdown } = await load(import.meta.url, "P10-E06.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("delay מחזירה Promise עם הערך אחרי הזמן", async () => {
  const t = Date.now();
  const v = await delay(40, "x");
  assert.equal(v, "x");
  assert.ok(Date.now() - t >= 35);
});
test("countdown", async () => {
  const out = [];
  const t = Date.now();
  await countdown(3, 15, (x) => out.push(x));
  assert.deepEqual(out, [3, 2, 1, "🚀"]);
  assert.ok(Date.now() - t >= 40, "מחכה בין המספרים");
});
