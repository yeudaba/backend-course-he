import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { contextCost } = await load(import.meta.url, "P29.5-E76.ts");
const P = { systemTokens: 1000, usdPerMTokIn: 4, usdPerMTokCacheRead: 0.2 };

test("שלושה צעדים", () => {
  // שולחים: 1200, 301200, 301700
  assert.deepEqual(contextCost([200, 300000, 500], P), { totalInputTokens: 604100, usdNoCache: 2.4164, usdWithCache: 1.26728 });
});
test("צעד אחד, ריק, בלי system", () => {
  assert.deepEqual(contextCost([500], P), { totalInputTokens: 1500, usdNoCache: 0.006, usdWithCache: 0.006 });
  assert.deepEqual(contextCost([], P), { totalInputTokens: 0, usdNoCache: 0, usdWithCache: 0 });
  assert.deepEqual(contextCost([10, 10, 10, 10], { systemTokens: 0, usdPerMTokIn: 3, usdPerMTokCacheRead: 0.3 }), { totalInputTokens: 100, usdNoCache: 0.0003, usdWithCache: 0.000138 });
});
test("תוצאה גדולה אחת קובעת את העלות", () => {
  const big = contextCost([200, 75000, 300, 300, 300, 300, 300, 300, 300, 300], { ...P, systemTokens: 3000 });
  assert.equal(big.totalInputTokens, 30000 + 200 * 10 + 75000 * 9 + 300 * (8 + 7 + 6 + 5 + 4 + 3 + 2 + 1));
  assert.ok(big.usdWithCache < big.usdNoCache / 3);
});
