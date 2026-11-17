// P16-E80: יצירת מוצר — Zod ואז INSERT
import { z } from "zod";

export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };

export const productInput = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.enum(["beans", "grinders", "brewing", "accessories"]),
  price: z.number().positive().max(100000).multipleOf(0.01),
  stock: z.number().int().min(0).default(0),
});

export async function createProduct(client: Db, input: unknown) {
  const data = productInput.parse(input);
  const { rows } = await client.query(
    `INSERT INTO products (name, category, price, stock, added_on)
     VALUES ($1, $2, $3, $4, CURRENT_DATE)
     RETURNING id, name, category, price, stock, is_active`,
    [data.name, data.category, data.price, data.stock],
  );
  const r = rows[0];
  return { id: r.id, name: r.name, category: r.category, price: Number(r.price), stock: r.stock, isActive: r.is_active };
}
