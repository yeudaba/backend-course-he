// P18-E41: route של העברה — Zod, transaction ו־status
import type { Pool } from "pg";
import { z } from "zod";

const TransferBody = z.object({
  fromId: z.number().int().positive(),
  toId: z.number().int().positive(),
  amount: z.number().positive().multipleOf(0.01),
});

class HttpFail extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export async function handleTransfer(pool: Pool, body: unknown): Promise<{ status: number; body: unknown }> {
  const parsed = TransferBody.safeParse(body);
  if (!parsed.success) return { status: 400, body: { error: "VALIDATION" } };
  const { fromId, toId, amount } = parsed.data;
  if (fromId === toId) return { status: 400, body: { error: "SAME_ACCOUNT" } };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const from = await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [amount, fromId]);
    if (from.rowCount === 0) throw new HttpFail(404, "ACCOUNT_NOT_FOUND");
    const to = await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [amount, toId]);
    if (to.rowCount === 0) throw new HttpFail(404, "ACCOUNT_NOT_FOUND");
    const { rows } = await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3) RETURNING id", [fromId, toId, amount]);
    await client.query("COMMIT");
    return { status: 201, body: { id: rows[0].id } };
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err instanceof HttpFail) return { status: err.status, body: { error: err.code } };
    if (err.code === "23514") return { status: 409, body: { error: "INSUFFICIENT_FUNDS" } };
    throw err;
  } finally {
    client.release();
  }
}
