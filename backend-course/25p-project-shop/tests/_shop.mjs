// עוזרים משותפים לבודקים של פרויקט 3
import assert from "node:assert/strict";
import { startApp, key } from "../../tools/app.mjs";

export { key };

export async function shop(t) {
  const app = await startApp(t, import.meta.url);
  const admin = await app.admin();
  async function product(fields = {}) {
    const r = await admin("POST", "/products", { name: "מטחנה ידנית", description: "פלדה", priceCents: 24900, stock: 10, category: "grinders", ...fields });
    assert.equal(r.status, 201, `יצירת מוצר: ${r.status} ${JSON.stringify(r.body)}`);
    return r.body;
  }
  async function orderOf(user, items) {
    for (const [productId, quantity] of items) {
      const r = await user("PUT", `/cart/items/${productId}`, { quantity });
      assert.equal(r.status, 200, `PUT /cart/items/${productId}: ${r.status} ${JSON.stringify(r.body)}`);
    }
    const r = await user("POST", "/orders", undefined, key("order"));
    assert.equal(r.status, 201, `POST /orders: ${r.status} ${JSON.stringify(r.body)}`);
    return r.body;
  }
  return { ...app, adminCall: admin, product, orderOf };
}
