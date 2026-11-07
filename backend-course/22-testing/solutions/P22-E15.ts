// P22-E15 — הקוד שבודקים (לא משנים אותו)
import type pg from "pg";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export class ProductsRepository {
  private readonly db: pg.Pool;
  constructor(db: pg.Pool) {
    this.db = db;
  }

  async create(name: string, price: number): Promise<Product> {
    const { rows } = await this.db.query("INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id, name, price::float AS price", [name, price]);
    return rows[0];
  }

  // חיפוש בלי תלות באותיות, טווח מחירים (כולל הגבולות), 10 בעמוד, לפי מחיר ואז id
  async search({ q = "", minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER, page = 1 } = {}): Promise<Product[]> {
    const { rows } = await this.db.query(
      `SELECT id, name, price::float AS price FROM products
       WHERE name ILIKE '%' || $1 || '%' AND price >= $2 AND price <= $3
       ORDER BY price, id
       LIMIT 10 OFFSET $4`,
      [q, minPrice, maxPrice, (page - 1) * 10],
    );
    return rows;
  }
}
