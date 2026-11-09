import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { inFlight, instancesNeeded, checkDbConnections } = await load(import.meta.url, "P28.5-E09.ts");

test("חוק Little: 2,000 בקשות בשנייה × 150ms = 300 בו־זמנית", () => {
  assert.equal(inFlight(2000, 150), 300);
  assert.equal(inFlight(50, 20), 1);
});
test("כמה instances", () => {
  assert.equal(instancesNeeded({ peakRps: 2000, latencyMs: 150, perInstance: 50 }), 9, "300 / (50 × 0.7) = 8.57 ← 9");
  assert.equal(instancesNeeded({ peakRps: 2000, latencyMs: 150, perInstance: 50, headroom: 0 }), 6);
  assert.equal(instancesNeeded({ peakRps: 10, latencyMs: 50, perInstance: 100 }), 2, "לפחות 2 — זמינות");
  assert.equal(instancesNeeded({ peakRps: 10, latencyMs: 50, perInstance: 100, min: 1 }), 1);
  assert.throws(() => instancesNeeded({ peakRps: 1, latencyMs: 1, perInstance: 1, headroom: 1 }));
});
test("חיבורים למסד: 9 instances × pool של 20 מול max_connections 100", () => {
  assert.deepEqual(checkDbConnections({ instances: 9, poolPerInstance: 20, maxConnections: 100 }), { needed: 180, available: 90, ok: false, maxPoolPerInstance: 10 });
  assert.equal(checkDbConnections({ instances: 3, poolPerInstance: 20, maxConnections: 100 }).ok, true);
});
