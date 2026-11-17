import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { fillerStats } = await load(import.meta.url, "P30-E73.ts");
const F = ["um", "like", "you know", "basically", "כאילו", "בעצם"];

test("ספירה, כולל ביטויים של כמה מילים", () => {
  const t = "Um, so basically I, like, built an API, you know? Like, it's likely fine. You know, um, basically it works. כאילו, בעצם, כאילו.";
  assert.deepEqual(fillerStats(t, F), {
    words: 23,
    fillers: 11,
    per100: 47.8,
    top: [{ filler: "um", count: 2 }, { filler: "like", count: 2 }, { filler: "you know", count: 2 }],
  });
});
test("קצוות", () => {
  assert.deepEqual(fillerStats("", F), { words: 0, fillers: 0, per100: 0, top: [] });
  assert.deepEqual(fillerStats("Unlike others, I was likely right", F), { words: 6, fillers: 0, per100: 0, top: [] });
  assert.deepEqual(fillerStats("you you know know", ["you know", ""]), { words: 4, fillers: 1, per100: 25, top: [{ filler: "you know", count: 1 }] });
  assert.deepEqual(fillerStats("so so so", ["so"]).top, [{ filler: "so", count: 3 }]);
});
