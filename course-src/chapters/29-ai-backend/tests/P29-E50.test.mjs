import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { verifyOrderIds } = await load(import.meta.url, "P29-E50.ts");

function repo() {
  const owners = new Map([[10, 7], [11, 7], [12, 8]]);
  const calls = [];
  let inFlight = 0, peak = 0;
  return {
    calls, peak: () => peak,
    async ownerOf(id) { calls.push(id); inFlight++; peak = Math.max(peak, inFlight); await new Promise((r) => setTimeout(r, 10)); inFlight--; return owners.get(id) ?? null; },
  };
}

test("רק של המשתמש, בלי כפילויות", async () => {
  const r = repo();
  const out = await verifyOrderIds([10, "11", 12, 99, 11, -3, 10, 2.5, null, 11], 7, r);
  assert.deepEqual(out, { valid: [10, 11], rejected: ["11", 12, 99, -3, 2.5, null] });
  assert.deepEqual([...r.calls].sort((a, b) => a - b), [10, 11, 12, 99]);
  assert.ok(r.peak() > 1, "במקביל");
});
test("ריק", async () => {
  assert.deepEqual(await verifyOrderIds([], 7, repo()), { valid: [], rejected: [] });
});
