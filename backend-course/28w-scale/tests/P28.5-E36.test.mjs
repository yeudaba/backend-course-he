import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sloReport } = await load(import.meta.url, "P28.5-E36.ts");

test("איטית או 5xx — לא טובה", () => {
  const reqs = [
    ...Array.from({ length: 990 }, () => ({ ms: 100, status: 200 })),
    ...Array.from({ length: 5 }, () => ({ ms: 900, status: 200 })),
    ...Array.from({ length: 3 }, () => ({ ms: 50, status: 503 })),
    { ms: 300, status: 404 },
    { ms: 300, status: 429 },
  ];
  assert.deepEqual(sloReport(reqs, { latencyMs: 300, target: 0.99 }), { total: 1000, good: 992, ratio: 0.992, burnRate: 0.8, ok: true });
  assert.deepEqual(sloReport(reqs, { latencyMs: 300, target: 0.999 }), { total: 1000, good: 992, ratio: 0.992, burnRate: 8, ok: false });
});
test("גבול בדיוק, וריק", () => {
  assert.deepEqual(sloReport([{ ms: 200, status: 200 }, { ms: 201, status: 200 }, { ms: 10, status: 500 }], { latencyMs: 200, target: 0.5 }), { total: 3, good: 1, ratio: 0.3333, burnRate: 1.3, ok: false });
  assert.deepEqual(sloReport([], { latencyMs: 100, target: 0.99 }), { total: 0, good: 0, ratio: 1, burnRate: 0, ok: true });
});
