// P25.7-E25
import type { Db } from "mongodb";
import type pg from "pg";

// מעבר מ־PostgreSQL ל־MongoDB: הזמנה + השורות שלה (order_items) ← מסמך אחד עם מערך items.
// אפשר להריץ שוב ושוב (idempotent): upsert לפי ה־id המקורי
export async function migrateOrders(pool: pg.Pool, db: Db) {
  const { rows } = await pool.query(`
    SELECT o.id, o.customer_id, o.status, o.created_at,
           json_agg(json_build_object('productId', i.product_id, 'name', p.name, 'price', i.unit_price, 'qty', i.quantity) ORDER BY i.id) AS items
    FROM orders o
    JOIN order_items i ON i.order_id = o.id
    JOIN products p ON p.id = i.product_id
    GROUP BY o.id
    ORDER BY o.id`);
  if (rows.length === 0) return { migrated: 0 };
  const ops = rows.map((r) => {
    const items = r.items.map((i: { productId: number; name: string; price: string | number; qty: number }) => ({ productId: `p${i.productId}`, name: i.name, price: Number(i.price), qty: i.qty }));
    const doc = {
      customerId: `c${r.customer_id}`,
      status: r.status,
      createdAt: r.created_at, // timestamptz ← Date (pg ממיר לבד) ← BSON Date
      items,
      total: Math.round(items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0) * 100) / 100,
    };
    return { replaceOne: { filter: { _id: `o${r.id}` }, replacement: doc, upsert: true } } as const;
  });
  // bulkWrite: פקודה אחת לשרת במקום אלף
  await db.collection<{ _id: string }>("orders").bulkWrite(ops, { ordered: false });
  return { migrated: rows.length };
}
