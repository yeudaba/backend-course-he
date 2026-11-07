import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load, listen } from "../../tools/load.mjs";

const { createProduct } = await load(import.meta.url, "P14-E21.mjs");

// שרת קטן בהתנהגות של שרת ההדגמה
function shop() {
  return http.createServer(async (req, res) => {
    let raw = "";
    for await (const c of req) raw += c;
    const send = (s, b) => { res.writeHead(s, { "Content-Type": "application/json" }); res.end(JSON.stringify(b)); };
    if (!req.headers["content-type"]?.includes("application/json")) return send(415, { error: "Content-Type חייב להיות application/json" });
    let body;
    try { body = JSON.parse(raw); } catch { return send(400, { error: "JSON לא תקין" }); }
    if (typeof body.price !== "number") return send(400, { error: "price חובה" });
    send(201, { id: 3, ...body });
  });
}

test("createProduct", async (t) => {
  const { base, close } = await listen(shop());
  t.after(close);
  await t.test("יוצר מוצר", async () => assert.deepEqual(await createProduct(base, { name: "מסך", price: 899 }), { id: 3, name: "מסך", price: 899 }));
  await t.test("שגיאה מהשרת נזרקת", () => assert.rejects(createProduct(base, { name: "מסך" }), { message: "HTTP 400: price חובה" }));
});
test("timeout", async (t) => {
  const { base, close } = await listen(http.createServer(() => {}));
  t.after(close);
  const realTimeout = AbortSignal.timeout;
  let asked;
  AbortSignal.timeout = (ms) => { asked = ms; return realTimeout.call(AbortSignal, 50); };
  try {
    await assert.rejects(createProduct(base, { name: "א", price: 1 }), { name: "TimeoutError" });
    assert.equal(asked, 5000);
  } finally {
    AbortSignal.timeout = realTimeout;
  }
});
