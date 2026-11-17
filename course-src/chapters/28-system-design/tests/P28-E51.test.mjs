import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { weightedRoundRobin } = await load(import.meta.url, "P28-E51.ts");
const take = (next, n) => Array.from({ length: n }, () => next());

test("a:5 b:1 c:1 — פיזור חלק", () => {
  const next = weightedRoundRobin([{ name: "a", weight: 5 }, { name: "b", weight: 1 }, { name: "c", weight: 1 }]);
  assert.deepEqual(take(next, 14).join(" "), "a a b a c a a a a b a c a a");
});
test("משקלים שווים — round robin רגיל", () => {
  const next = weightedRoundRobin([{ name: "x", weight: 2 }, { name: "y", weight: 2 }, { name: "z", weight: 2 }]);
  assert.deepEqual(take(next, 6), ["x", "y", "z", "x", "y", "z"]);
});
test("בכל סבב — כל שרת בדיוק weight פעמים", () => {
  const servers = [{ name: "s1", weight: 3 }, { name: "s2", weight: 7 }, { name: "s3", weight: 2 }, { name: "s4", weight: 1 }];
  const next = weightedRoundRobin(servers);
  for (let round = 0; round < 3; round++) {
    const counts = {};
    for (const n of take(next, 13)) counts[n] = (counts[n] ?? 0) + 1;
    assert.deepEqual(counts, { s1: 3, s2: 7, s3: 2, s4: 1 });
  }
  const seq = take(weightedRoundRobin([{ name: "big", weight: 3 }, { name: "small", weight: 1 }]), 4);
  assert.deepEqual(seq, ["big", "big", "small", "big"]);
});
test("שני מופעים לא חולקים מצב", () => {
  const s = [{ name: "a", weight: 1 }, { name: "b", weight: 1 }];
  const n1 = weightedRoundRobin(s);
  const n2 = weightedRoundRobin(s);
  assert.equal(n1(), "a");
  assert.equal(n2(), "a");
});
test("שגיאות", () => {
  assert.throws(() => weightedRoundRobin([]));
  assert.throws(() => weightedRoundRobin([{ name: "a", weight: 0 }]));
  assert.throws(() => weightedRoundRobin([{ name: "a", weight: 1.5 }]));
  assert.throws(() => weightedRoundRobin([{ name: "a", weight: -2 }]));
});
