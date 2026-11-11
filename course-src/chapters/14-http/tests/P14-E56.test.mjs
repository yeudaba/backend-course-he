import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E56.mjs", ["toApiJson"])).toApiJson;

test("מפתחות ל־camelCase, Date ל־ISO, undefined מושמט", async () => {
  const f = await get();
  const input = { order_id: 17, created_at: new Date("2026-11-01T10:00:00Z"), shipped_at: null, note: undefined, vipLevel: 2, total_price_agorot: 5970 };
  const out = f(input);
  assert.deepEqual(out, { orderId: 17, createdAt: "2026-11-01T10:00:00.000Z", shippedAt: null, vipLevel: 2, totalPriceAgorot: 5970 });
  assert.equal("note" in out, false, "מפתח עם undefined לא מופיע");
});
test("לעומק — אובייקטים בתוך מערכים בתוך אובייקטים", async () => {
  const f = await get();
  const input = {
    customer: { full_name: "דנה", address: { zip_code: "12345" } },
    items: [{ product_id: 3, added_at: new Date(0) }, { product_id: 4, tags: ["a_b", "c"] }],
    matrix: [[{ x_y: 1 }]],
  };
  assert.deepEqual(f(input), {
    customer: { fullName: "דנה", address: { zipCode: "12345" } },
    items: [{ productId: 3, addedAt: "1970-01-01T00:00:00.000Z" }, { productId: 4, tags: ["a_b", "c"] }],
    matrix: [[{ xY: 1 }]],
  }, "ערכים שהם מחרוזות לא משתנים — רק מפתחות");
});
test("ערכים פשוטים ומערך בשורש", async () => {
  const f = await get();
  assert.equal(f(5), 5);
  assert.equal(f("a_b"), "a_b");
  assert.equal(f(null), null);
  assert.equal(f(true), true);
  assert.equal(f(new Date("2026-01-02T03:04:05Z")), "2026-01-02T03:04:05.000Z");
  assert.deepEqual(f([{ a_b: 1 }, 2]), [{ aB: 1 }, 2]);
});
test("הקלט לא משתנה", async () => {
  const f = await get();
  const d = new Date(0);
  const input = { user_id: 1, items: [{ item_id: 2, at: d }] };
  f(input);
  assert.deepEqual(input, { user_id: 1, items: [{ item_id: 2, at: d }] });
  assert.ok(input.items[0].at instanceof Date);
});
