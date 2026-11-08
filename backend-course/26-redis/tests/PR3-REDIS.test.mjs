import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { Redis } from "ioredis";
import { startApp, key } from "../../tools/app.mjs";
import { redisUrl } from "../../tools/redis.mjs";

// פרויקט 3, שלב 5 (פרק 26): Redis — cache לרשימת המוצרים, ותור: מייל אישור וביטול אוטומטי של הזמנות שלא שולמו
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shop(t, env = {}) {
  const prefix = `chk${randomBytes(3).toString("hex")}`;
  const raw = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
  try {
    await raw.connect();
  } catch (err) {
    throw new Error(`אין חיבור ל־Redis (${redisUrl}): ${err.message}`);
  }
  t.after(async () => {
    let cursor = "0";
    do {
      const [next, keys] = await raw.scan(cursor, "MATCH", `${prefix}:*`, "COUNT", 500);
      if (keys.length) await raw.del(...keys);
      cursor = next;
    } while (cursor !== "0");
    await raw.quit();
  });
  const app = await startApp(t, import.meta.url, { env: { REDIS_URL: redisUrl, REDIS_PREFIX: prefix, ...env } });
  const admin = await app.admin();
  const product = async (fields = {}) => (await admin("POST", "/products", { name: "מטחנה", priceCents: 24900, stock: 10, category: "grinders", ...fields })).body;
  return { ...app, adminCall: admin, product, raw, prefix };
}

async function until(fn, ms, what) {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) assert.fail(`${what} — לא קרה תוך ${ms / 1000} שניות`);
    await sleep(250);
  }
}

test("cache לרשימת המוצרים", async (t) => {
  const { call, adminCall, product, customer, raw, prefix } = await shop(t);
  const p = await product({ priceCents: 24900, stock: 5 });
  const first = await call("GET", "/products?sort=price");
  assert.equal(first.headers.get("x-cache"), "MISS", "בקשה ראשונה ← X-Cache: MISS");
  const second = await call("GET", "/products?sort=price");
  assert.equal(second.headers.get("x-cache"), "HIT", "אותה בקשה שוב ← X-Cache: HIT");
  assert.deepEqual(second.body, first.body, "HIT מחזיר בדיוק אותו דבר");
  assert.equal((await call("GET", "/products?sort=-price")).headers.get("x-cache"), "MISS", "query אחר ← מפתח אחר");

  const keys = await raw.keys(`${prefix}:*`);
  assert.ok(keys.length > 0, `מפתחות ב־Redis מתחילים ב־REDIS_PREFIX ("${prefix}:…")`);

  await adminCall("PATCH", `/products/${p.id}`, { priceCents: 19900 });
  const afterEdit = await call("GET", "/products?sort=price");
  assert.equal(afterEdit.headers.get("x-cache"), "MISS", "מנהל שינה מוצר ← ה־cache לא תקף");
  assert.equal(afterEdit.body.data[0].priceCents, 19900, "המחיר החדש — מיד");

  const dana = await customer();
  await dana("PUT", `/cart/items/${p.id}`, { quantity: 2 });
  assert.equal((await dana("POST", "/orders", undefined, key())).status, 201);
  const afterOrder = await call("GET", "/products?sort=price");
  assert.equal(afterOrder.body.data[0].stock, 3, "אחרי הזמנה — המלאי ברשימה מעודכן (גם המלאי הוא חלק מה־cache)");
});

test("מייל אישור — דרך התור, פעם אחת", async (t) => {
  const { adminCall, product, customer } = await shop(t);
  const p = await product();
  const dana = await customer("dana@example.com");
  await dana("PUT", `/cart/items/${p.id}`, { quantity: 1 });
  const order = (await dana("POST", "/orders", undefined, key())).body;
  await sleep(800);
  assert.equal((await adminCall("GET", "/emails")).body.length, 0, "לפני תשלום — אין מייל אישור");
  const paid = await dana("POST", `/orders/${order.id}/pay`, { cardNumber: "4242424242424242" }, key());
  assert.equal(paid.status, 200);
  const emails = await until(async () => {
    const r = await adminCall("GET", "/emails");
    return r.body.length ? r.body : null;
  }, 10000, "מייל אישור ב־GET /emails");
  assert.equal(emails[0].to, "dana@example.com");
  assert.match(emails[0].subject, new RegExp(`#?${order.id}\\b`), "הנושא כולל את מספר ההזמנה");
  assert.equal((await dana("GET", "/emails")).status, 403, "GET /emails — רק למנהל");
  await sleep(1500);
  assert.equal((await adminCall("GET", "/emails")).body.length, 1, "בדיוק מייל אחד");
});

test("הזמנה שלא שולמה — מתבטלת לבד והמלאי חוזר", async (t) => {
  const { call, product, customer } = await shop(t, { ORDER_PAYMENT_TIMEOUT_SECONDS: "2" });
  const p = await product({ stock: 5 });
  const dana = await customer();
  await dana("PUT", `/cart/items/${p.id}`, { quantity: 2 });
  const unpaid = (await dana("POST", "/orders", undefined, key())).body;
  await dana("PUT", `/cart/items/${p.id}`, { quantity: 1 });
  const paid = (await dana("POST", "/orders", undefined, key())).body;
  assert.equal((await dana("POST", `/orders/${paid.id}/pay`, { cardNumber: "4242424242424242" }, key())).status, 200);
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 2);

  await until(async () => (await dana("GET", `/orders/${unpaid.id}`)).body.status === "cancelled", 15000, "הזמנה שלא שולמה תוך ORDER_PAYMENT_TIMEOUT_SECONDS ← cancelled");
  assert.equal((await call("GET", `/products/${p.id}`)).body.stock, 4, "המלאי של ההזמנה שפגה — חזר");
  await sleep(2500);
  assert.equal((await dana("GET", `/orders/${paid.id}`)).body.status, "paid", "הזמנה ששולמה — לא נוגעים");
});
