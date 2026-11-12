// P25.5-E84: GET /products עם cursor
import { Router } from "express";
import type { Pool, RowDataPacket } from "mysql2/promise";

const intParam = (v: unknown, def: number | null, min: number, max: number) => {
  if (v === undefined) return def;
  if (typeof v !== "string" || !/^\d+$/.test(v)) return NaN;
  const n = Number(v);
  return n >= min && n <= max ? n : NaN;
};

export function productsRouter(pool: Pool) {
  const router = Router();
  router.get("/products", async (req, res, next) => {
    const limit = intParam(req.query.limit, 10, 1, 50) as number;
    const after = intParam(req.query.after, 0, 0, Number.MAX_SAFE_INTEGER) as number;
    const category = req.query.category;
    if (Number.isNaN(limit) || Number.isNaN(after) || (category !== undefined && typeof category !== "string")) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR" } });
      return;
    }
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id, name, price FROM products
          WHERE is_active AND id > ? ${category !== undefined ? "AND category = ?" : ""}
          ORDER BY id LIMIT ?`,
        category !== undefined ? [after, category, limit] : [after, limit],
      );
      const items = rows.map((r) => ({ id: Number(r.id), name: String(r.name), priceCents: Math.round(Number(r.price) * 100) }));
      res.json({ items, nextAfter: items.length === limit ? items[items.length - 1].id : null });
    } catch (err) {
      next(err);
    }
  });
  return router;
}
