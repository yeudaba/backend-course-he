// P25.5-E10: מה mysql2 מחזיר, ואיך הופכים את זה לטיפוסים של האפליקציה
import type { Connection } from "mysql2/promise";

export interface Product {
  id: number;
  name: string;
  priceCents: number;
  isActive: boolean;
  attributes: Record<string, unknown> | null;
}

export function toProduct(row: { id: number; name: string; price: string | number; is_active: number | boolean; attributes: unknown }): Product {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function listProducts(conn: Connection, category: string): Promise<Product[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}
