import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { rolloutBounds, simulateRollout } = await load(import.meta.url, "P25.5-E17.ts");
const fmt = (steps) => steps.map((s) => `${s.old}/${s.new}`).join(" ");

test("rolloutBounds: מספרים ואחוזים — surge מעגל למעלה, unavailable למטה", () => {
  assert.deepEqual(rolloutBounds(4, 1, 0), { maxPods: 5, minAvailable: 4 });
  assert.deepEqual(rolloutBounds(10, "25%", "25%"), { maxPods: 13, minAvailable: 8 });
  assert.deepEqual(rolloutBounds(3, "25%", "25%"), { maxPods: 4, minAvailable: 3 }, "3×25% = 0.75: surge ← 1, unavailable ← 0");
  assert.deepEqual(rolloutBounds(2, "0%", "50%"), { maxPods: 2, minAvailable: 1 });
});
test("rolloutBounds: שגיאות", () => {
  assert.throws(() => rolloutBounds(4, 0, 0), "שניהם 0 — ה־rollout לא יכול להתקדם");
  assert.throws(() => rolloutBounds(4, "0%", "20%"), "4×20% = 0.8 ← floor = 0, ו־surge 0: גם זה תקוע");
  assert.throws(() => rolloutBounds(0, 1, 0));
  assert.throws(() => rolloutBounds(4, "abc", 0));
  assert.throws(() => rolloutBounds(4, -1, 1));
});
test("simulateRollout: maxSurge 1, maxUnavailable 0 — אחד אחד, בלי לרדת מתחת ל־4", () => {
  const r = simulateRollout(4, 1, 0);
  assert.equal(fmt(r.steps), "4/0 4/1 3/2 2/3 1/4 0/4");
});
test("simulateRollout: 25%/25% — מהר יותר", () => {
  assert.equal(fmt(simulateRollout(4, "25%", "25%").steps), "4/0 3/2 1/4 0/4");
  assert.equal(fmt(simulateRollout(10, "25%", 0).steps), "10/0 10/3 7/6 4/9 1/10 0/10");
});
test("simulateRollout: maxSurge 0 (אין מקום ל־pod נוסף) — קודם מורידים ישן", () => {
  assert.equal(fmt(simulateRollout(3, 0, 1).steps), "3/0 2/1 1/2 0/3");
});
test("האינווריאנטים מתקיימים בכל צעד", () => {
  for (const [n, s, u] of [[5, 2, 1], [7, "30%", "10%"], [1, 1, 0], [6, 0, 2]]) {
    const r = simulateRollout(n, s, u);
    let readyNew = 0;
    for (const st of r.steps) {
      assert.ok(st.old + st.new <= r.maxPods, `${n},${s},${u}: יותר מ־maxPods ב־${st.old}/${st.new}`);
      assert.ok(st.old + readyNew >= Math.min(r.minAvailable, n), `${n},${s},${u}: פחות מ־minAvailable זמינים`);
      readyNew = st.new;
    }
    assert.deepEqual(r.steps.at(-1), { old: 0, new: n });
  }
});
