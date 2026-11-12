import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { productsCacheKey } = await load(import.meta.url, "P26-E94.ts");

test("ברירות מחדל, וסדר קבוע", () => {
  assert.equal(productsCacheKey({ q: "V60" }), '{"q":"V60","sort":"newest","page":1,"limit":20}');
  assert.equal(productsCacheKey({ limit: "10", page: "2", q: " V60 ", sort: "price_asc" }), '{"q":"V60","sort":"price_asc","page":2,"limit":10}');
  assert.equal(productsCacheKey({}), '{"sort":"newest","page":1,"limit":20}');
  assert.equal(productsCacheKey({ q: "   " }), '{"sort":"newest","page":1,"limit":20}', "q ריק ← בלי q");
});
test("אותה בקשה ← אותו מפתח; פרמטרים זרים לא נכנסים", () => {
  assert.equal(productsCacheKey({ q: "V60", page: "1" }), productsCacheKey({ q: "V60" }));
  assert.equal(productsCacheKey({ q: "V60", utm_source: "facebook" }), productsCacheKey({ q: "V60" }));
});
test("לא תקין ← VALIDATION_ERROR", () => {
  for (const q of [{ limit: "999999" }, { limit: "0" }, { page: "0" }, { page: "1.5" }, { sort: "cheapest" }, { page: "abc" }]) {
    assert.throws(() => productsCacheKey(q), { message: "VALIDATION_ERROR" }, JSON.stringify(q));
  }
});
