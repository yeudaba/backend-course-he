import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { compareModels } = await load(import.meta.url, "P29-E33.ts");

test("חודש של צ׳אט", () => {
  assert.deepEqual(compareModels({ requestsPerDay: 1000, inputTokens: 2000, outputTokens: 500 }), [
    { model: "claude-haiku-5-5", usd: 13.5 },
    { model: "claude-sonnet-5-5", usd: 270 },
    { model: "claude-opus-5-5", usd: 540 },
  ]);
});
test("ימים, עיגול לסנט", () => {
  assert.deepEqual(compareModels({ requestsPerDay: 7, inputTokens: 333, outputTokens: 17, days: 1 }), [
    { model: "claude-haiku-5-5", usd: 0 },
    { model: "claude-sonnet-5-5", usd: 0.01 },
    { model: "claude-opus-5-5", usd: 0.01 },
  ]);
  assert.equal(compareModels({ requestsPerDay: 2_000_000, inputTokens: 200, outputTokens: 10, days: 1 })[0].usd, 50);
});
test("קלט לא תקין", () => {
  assert.throws(() => compareModels({ requestsPerDay: -1, inputTokens: 1, outputTokens: 1 }), RangeError);
  assert.throws(() => compareModels({ requestsPerDay: 1, inputTokens: NaN, outputTokens: 1 }), RangeError);
  assert.throws(() => compareModels({ requestsPerDay: 1, inputTokens: 1, outputTokens: 1, days: Infinity }), RangeError);
});
