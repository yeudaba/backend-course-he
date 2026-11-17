import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createIdempotency } = await load(import.meta.url, "P27-E93.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("fresh, replayed, KEY_REUSED", async () => {
  let t = 0, calls = 0;
  const idem = createIdempotency(1000, () => t);
  const charge = async () => ({ chargeId: `ch_${++calls}` });
  assert.deepEqual(await idem.run("k1", { amount: 100 }, charge), { status: "fresh", result: { chargeId: "ch_1" } });
  assert.deepEqual(await idem.run("k1", { amount: 100 }, charge), { status: "replayed", result: { chargeId: "ch_1" } });
  await assert.rejects(idem.run("k1", { amount: 999 }, charge), { message: "KEY_REUSED" });
  assert.equal(calls, 1);
  t = 1000;
  assert.deepEqual(await idem.run("k1", { amount: 999 }, charge), { status: "fresh", result: { chargeId: "ch_2" } }, "אחרי ttl — נשכח");
});
test("במקביל — פעם אחת; כישלון לא נשמר", async () => {
  let calls = 0;
  const idem = createIdempotency(60_000);
  const slow = async () => { calls++; await sleep(50); return calls; };
  const r = await Promise.all([idem.run("k", 1, slow), idem.run("k", 1, slow), idem.run("k", 1, slow)]);
  assert.equal(calls, 1);
  assert.deepEqual(r.map((x) => x.status).sort(), ["fresh", "replayed", "replayed"]);
  assert.ok(r.every((x) => x.result === 1));
  let n = 0;
  const flaky = async () => { n++; if (n === 1) throw new Error("declined"); return "ok"; };
  await assert.rejects(idem.run("f", 1, flaky), { message: "declined" });
  assert.deepEqual(await idem.run("f", 1, flaky), { status: "fresh", result: "ok" });
});
