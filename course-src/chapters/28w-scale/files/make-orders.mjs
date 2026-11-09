// מייצר את files/orders.parquet — 60,000 שורות הזמנה, דטרמיניסטי (אותו קובץ בכל הרצה).
// הרצה: node files/make-orders.mjs   (צריך @duckdb/node-api)
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DuckDBInstance } from "@duckdb/node-api";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "orders.parquet");
let seed = 20261108;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const products = [
  ["Colombia Supremo 1kg", "beans", 8990], ["Ethiopia Yirgacheffe 250g", "beans", 5490], ["Espresso Blend 1kg", "beans", 7990],
  ["Decaf 500g", "beans", 4990], ["Hand Grinder", "equipment", 18900], ["French Press 1L", "brewing", 12900],
  ["V60 Dripper", "brewing", 6900], ["Paper Filters x100", "brewing", 2490], ["Milk Frother", "equipment", 14900], ["Travel Mug", "accessories", 7900],
];
const countries = ["IL", "IL", "IL", "IL", "US", "DE", "GB", "FR"];
const start = Date.UTC(2026, 9, 1); // 1.10.2026 00:00 UTC

const db = await DuckDBInstance.create(":memory:");
const c = await db.connect();
await c.run(`CREATE TABLE orders (order_id BIGINT, customer_id INTEGER, product VARCHAR, category VARCHAR,
  quantity INTEGER, price_cents INTEGER, country VARCHAR, created_at TIMESTAMPTZ)`);
const app = await c.createAppender("orders");
for (let i = 1; i <= 60000; i++) {
  const [product, category, price] = pick(products);
  const ts = new Date(start + Math.floor(rand() * 31 * 24 * 3600 * 1000));
  app.appendBigInt(BigInt(i));
  app.appendInteger(1 + Math.floor(rand() * 4000));
  app.appendVarchar(product);
  app.appendVarchar(category);
  app.appendInteger(1 + Math.floor(rand() * rand() * 5));
  app.appendInteger(price);
  app.appendVarchar(pick(countries));
  app.appendVarchar(ts.toISOString());
  app.endRow();
}
app.closeSync();
await c.run("SET TimeZone = 'UTC'");
await c.run(`COPY (SELECT * FROM orders ORDER BY order_id) TO '${out}' (FORMAT parquet, COMPRESSION zstd)`);
console.log("wrote", out);
