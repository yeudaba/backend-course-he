import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { peakConcurrency } = await load(import.meta.url, "P27-E19.ts");

test("כמה סשנים במקביל בשיא — ומתי לראשונה", () => {
  const sessions = [
    { start: 1, end: 5 },
    { start: 2, end: 7 },
    { start: 4, end: 6 },
    { start: 6, end: 9 },
    { start: 8, end: 10 },
  ];
  assert.deepEqual(peakConcurrency(sessions), { peak: 3, at: 4 });
});
test("end לא כולל: נגמר ב־10 ומתחיל ב־10 — לא חופפים", () => {
  assert.deepEqual(peakConcurrency([{ start: 0, end: 10 }, { start: 10, end: 20 }]), { peak: 1, at: 0 });
  assert.deepEqual(peakConcurrency([{ start: 0, end: 10 }, { start: 9, end: 20 }]), { peak: 2, at: 9 });
});
test("ריק ← 0, null; סשן באורך 0 לא נספר", () => {
  assert.deepEqual(peakConcurrency([]), { peak: 0, at: null });
  assert.deepEqual(peakConcurrency([{ start: 5, end: 5 }]), { peak: 0, at: null });
});
test("100,000 סשנים — מהר (O(n log n))", () => {
  const rnd = seeded(3);
  const sessions = Array.from({ length: 100_000 }, () => {
    const start = Math.floor(rnd() * 86_400);
    return { start, end: start + 1 + Math.floor(rnd() * 600) };
  });
  const r = fastEnough(() => peakConcurrency(sessions), 1000, "peakConcurrency על 100,000 סשנים");
  assert.ok(r.peak > 300 && r.peak < 1000, `שיא סביר (${r.peak})`);
});
