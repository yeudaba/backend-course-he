// P25.5-E83: repository של מוצרים מעל mysql2
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type Product = { id: number; name: string; category: string; priceCents: number; stock: number; isActive: boolean; attributes: Record<string, unknown> | null };

export class MysqlProductsRepository {
  #pool: Pool;
  constructor(pool: Pool) {
    this.#pool = pool;
  }

  #toProduct(r: RowDataPacket): Product {
    return {
      id: Number(r.id),
      name: String(r.name),
      category: String(r.category),
      priceCents: Math.round(Number(r.price) * 100),
      stock: Number(r.stock),
      isActive: Boolean(r.is_active),
      attributes: r.attributes ?? null,
    };
  }

  async findById(id: number): Promise<Product | null> {
    const [rows] = await this.#pool.execute<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [id]);
    return rows.length ? this.#toProduct(rows[0]) : null;
  }

  async list({ category, onlyActive = true, limit = 20 }: { category?: string; onlyActive?: boolean; limit?: number } = {}): Promise<Product[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (category !== undefined) {
      where.push("category = ?");
      params.push(category);
    }
    if (onlyActive) where.push("is_active");
    const sql = `SELECT * FROM products ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id LIMIT ?`;
    const [rows] = await this.#pool.query<RowDataPacket[]>(sql, [...params, limit]);
    return rows.map((r) => this.#toProduct(r));
  }

  async adjustStock(id: number, delta: number): Promise<number> {
    const [res] = await this.#pool.execute<ResultSetHeader>("UPDATE products SET stock = stock + ? WHERE id = ? AND stock + ? >= 0", [delta, id, delta]);
    if (res.affectedRows === 0) {
      const exists = await this.findById(id);
      throw new Error(exists ? "OUT_OF_STOCK" : "NOT_FOUND");
    }
    const p = await this.findById(id);
    return p!.stock;
  }
}
