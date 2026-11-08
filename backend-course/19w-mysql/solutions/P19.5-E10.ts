// P19.5-E10
import type { Connection } from "mysql2/promise";

export interface Product {
  id: number;
  name: string;
  priceCents: number;
  isActive: boolean;
  attributes: Record<string, unknown> | null;
}

// mysql2 בברירת מחדל: DECIMAL ← מחרוזת ("89.90" — כדי לא לאבד דיוק), BOOLEAN (TINYINT(1)) ← 0/1,
// JSON ← אובייקט מפוענח. ממירים פעם אחת, במקום אחד, לטיפוסים של האפליקציה
export function toProduct(row: { id: number; name: string; price: string | number; is_active: number | boolean; attributes: unknown }): Product {
  const priceCents = Math.round(Number(row.price) * 100); // 89.9 * 100 = 8990.000000000001 — לכן round
  return {
    id: row.id,
    name: row.name,
    priceCents,
    isActive: row.is_active === 1 || row.is_active === true,
    attributes: typeof row.attributes === "string" ? JSON.parse(row.attributes) : ((row.attributes as Record<string, unknown> | null) ?? null),
  };
}

export async function listProducts(conn: Connection, category: string): Promise<Product[]> {
  const [rows] = await conn.execute<any[]>("SELECT id, name, price, is_active, attributes FROM products WHERE category = ? ORDER BY id", [category]);
  return rows.map(toProduct);
}
