import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { fanoutCost } = await load(import.meta.url, "P28-E88.ts");

test("המספרים מהשיעור", () => {
  const users = [
    ...Array.from({ length: 10_000 }, (_, i) => ({ id: `u${i}`, followers: 200, postsPerDay: 2 })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `celeb${i}`, followers: 2_000_000, postsPerDay: 10 })),
  ];
  const r = fanoutCost(users, 100_000);
  assert.equal(r.pushAll, 104_000_000);
  assert.equal(r.hybrid, 4_000_000);
  assert.deepEqual(r.celebrities, ["celeb0", "celeb1", "celeb2", "celeb3", "celeb4"]);
  assert.equal(r.saved, 96);
});
test("סף כולל, סדר, אפס", () => {
  const r = fanoutCost([{ id: "b", followers: 1000, postsPerDay: 1 }, { id: "a", followers: 999, postsPerDay: 3 }, { id: "c", followers: 5000, postsPerDay: 0 }], 1000);
  assert.deepEqual(r, { pushAll: 3997, hybrid: 2997, celebrities: ["b", "c"], saved: 25 });
  assert.deepEqual(fanoutCost([], 10), { pushAll: 0, hybrid: 0, celebrities: [], saved: 0 });
});
