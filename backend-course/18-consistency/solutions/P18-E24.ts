// P18-E24
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  productId?: number;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

interface Item { productId: number; quantity: number }

async function existingOrder(pool: Pool, key: string) {
  const { rows } = await pool.query("SELECT id, total FROM shop_orders WHERE idempotency_key = $1", [key]);
  return rows[0] && { orderId: rows[0].id, total: Number(rows[0].total), replayed: true };
}

export async function checkout(pool: Pool, { customerId, items, idempotencyKey }: { customerId: number; items: Item[]; idempotencyKey: string }) {
  if (items.length === 0) throw new AppError("EMPTY_CART");
  const before = await existingOrder(pool, idempotencyKey);
  if (before) return before;

  const qty = new Map<number, number>();
  for (const i of items) qty.set(i.productId, (qty.get(i.productId) ?? 0) + i.quantity);
  const ids = [...qty.keys()].sort((a, b) => a - b);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: products } = await client.query("SELECT id, price, stock FROM catalog WHERE id = ANY($1) ORDER BY id FOR UPDATE", [ids]);
    if (products.length !== ids.length) throw new AppError("PRODUCT_NOT_FOUND");
    for (const p of products) {
      if (p.stock < qty.get(p.id)!) {
        const err = new AppError("OUT_OF_STOCK");
        err.productId = p.id;
        throw err;
      }
    }
    const total = products.reduce((sum, p) => sum + Number(p.price) * qty.get(p.id)!, 0);
    let orderId: number;
    try {
      const { rows } = await client.query(
        "INSERT INTO shop_orders (customer_id, idempotency_key, total) VALUES ($1, $2, $3) RETURNING id",
        [customerId, idempotencyKey, total.toFixed(2)]
      );
      orderId = rows[0].id;
    } catch (err) {
      if ((err as { code?: string }).code !== "23505") throw err;
      await client.query("ROLLBACK");
      return (await existingOrder(pool, idempotencyKey))!; // בקשה מקבילה עם אותו מפתח ניצחה
    }
    for (const p of products) {
      await client.query("INSERT INTO shop_order_lines (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)", [orderId, p.id, qty.get(p.id), p.price]);
      await client.query("UPDATE catalog SET stock = stock - $1 WHERE id = $2", [qty.get(p.id), p.id]);
    }
    await client.query("COMMIT");
    return { orderId, total: Number(total.toFixed(2)), replayed: false };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
