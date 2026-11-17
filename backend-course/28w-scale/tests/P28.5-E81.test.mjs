import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { duck } from "./_duck.mjs";

const { revenueByCategory } = await load(import.meta.url, "P28.5-E81.ts");

async function expected(d, country, from, to) {
  const rows = await d.rows(`SELECT category, count(*) AS orders, round(sum(quantity * price_cents) / 100.0, 2) AS revenue FROM orders
    WHERE created_at >= $1::TIMESTAMPTZ AND created_at < $2::TIMESTAMPTZ ${country ? "AND country = $3" : ""} GROUP BY 1 ORDER BY revenue DESC`, country ? [from, to, country] : [from, to]);
  return rows.map((r) => ({ category: r.category, orders: Number(r.orders), revenue: Number(r.revenue) }));
}

test("שבוע אחד, ישראל ובלי מדינה", async (t) => {
  const d = await duck(t);
  const a = await revenueByCategory(d.conn, { country: "IL", from: "2026-10-05T00:00:00Z", to: "2026-10-12T00:00:00Z" });
  assert.deepEqual(a, await expected(d, "IL", "2026-10-05T00:00:00Z", "2026-10-12T00:00:00Z"));
  assert.equal(typeof a[0].orders, "number");
  assert.equal(typeof a[0].revenue, "number");
  const b = await revenueByCategory(d.conn, { from: "2026-10-01T00:00:00Z", to: "2026-11-01T00:00:00Z" });
  assert.equal(b.reduce((s, r) => s + r.orders, 0), 60000);
});
test("פרמטרים, לא שרשור", async (t) => {
  const d = await duck(t);
  const r = await revenueByCategory(d.conn, { country: "IL' OR '1'='1", from: "2026-10-01T00:00:00Z", to: "2026-11-01T00:00:00Z" });
  assert.deepEqual(r, []);
  await assert.rejects(revenueByCategory(d.conn, { from: "yesterday", to: "2026-11-01" }));
});
