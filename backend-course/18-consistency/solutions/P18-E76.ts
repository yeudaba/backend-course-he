// P18-E76: פיד עם cursor אטום
import type { Pool } from "pg";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export function encodeCursor(createdAt: Date, id: number): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

export function decodeCursor(cursor: string): { createdAt: Date; id: number } {
  const [iso, idText, ...rest] = Buffer.from(cursor, "base64url").toString().split("|");
  const createdAt = new Date(iso);
  const id = Number(idText);
  if (rest.length > 0 || !iso || Number.isNaN(createdAt.getTime()) || !Number.isInteger(id) || id <= 0) throw new AppError("BAD_CURSOR");
  return { createdAt, id };
}

export async function feed(pool: Pool, { customerId, cursor, limit = 20 }: { customerId: number; cursor?: string; limit?: number }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new AppError("BAD_LIMIT");
  const params: unknown[] = [customerId];
  let where = "customer_id = $1";
  if (cursor !== undefined) {
    const c = decodeCursor(cursor);
    params.push(c.createdAt, c.id);
    where += " AND (created_at, id) < ($2, $3)";
  }
  params.push(limit + 1);
  const { rows } = await pool.query(
    `SELECT id, total, created_at FROM big_orders WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT $${params.length}`,
    params,
  );
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  return {
    data: page.map((r) => ({ id: r.id, total: Number(r.total) })),
    nextCursor: rows.length > limit && last ? encodeCursor(last.created_at, last.id) : null,
  };
}
