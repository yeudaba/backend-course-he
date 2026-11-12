import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { syncChain, withBroker } = await load(import.meta.url, "P26.5-E39.ts");

test("syncChain", () => {
  assert.deepEqual(syncChain(Array(4).fill({ ms: 200, availability: 0.999 })), { latencyMs: 800, availability: 0.996006 });
  assert.deepEqual(syncChain([{ ms: 50, availability: 0.999 }, { ms: 300, availability: 0.9 }]), { latencyMs: 350, availability: 0.8991 });
  assert.deepEqual(syncChain([]), { latencyMs: 0, availability: 1 });
});
test("withBroker", () => {
  assert.deepEqual(withBroker({ ms: 5, availability: 0.9995 }), { latencyMs: 5, availability: 0.9995 });
  assert.deepEqual(withBroker({ ms: 3, availability: 0.99999949 }), { latencyMs: 3, availability: 0.999999 });
});
