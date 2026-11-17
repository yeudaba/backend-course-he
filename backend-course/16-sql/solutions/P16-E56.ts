// P16-E56: חיפוש מוצרים מ־Node
export type Db = { query(text: string, values?: unknown[]): Promise<{ rows: any[] }> };
export type Found = { id: number; name: string; price: number };

export async function searchProducts(client: Db, { q, category, limit = 10 }: { q?: string; category?: string; limit?: number }): Promise<Found[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error("limit חייב להיות 1–50");
  const conditions = ["is_active"];
  const values: unknown[] = [];
  if (q && q.trim()) {
    values.push(`%${q.trim().replace(/[\\%_]/g, "\\$&")}%`);
    conditions.push(`name ILIKE $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  values.push(limit);
  const text = `SELECT id, name, price FROM products WHERE ${conditions.join(" AND ")} ORDER BY name, id LIMIT $${values.length}`;
  const { rows } = await client.query(text, values);
  return rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price) }));
}
