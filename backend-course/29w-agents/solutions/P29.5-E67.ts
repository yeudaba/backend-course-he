// P29.5-E67: guardrail להחזר במסד
import type pg from "pg";

type Req = { customerId: number; orderId: number; amountCents: number; toolUseId: string; maxCents: number };
type Reason = "bad_amount" | "not_found" | "bad_status" | "over_limit" | "over_remaining";
type Out = { status: "refunded"; remainingCents: number } | { status: "duplicate" } | { status: "rejected"; reason: Reason };

export async function refundWithGuard(pool: pg.Pool, req: Req): Promise<Out> {
  if (!Number.isInteger(req.amountCents) || req.amountCents <= 0) return { status: "rejected", reason: "bad_amount" };
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const reject = async (reason: Reason): Promise<Out> => {
      await c.query("ROLLBACK");
      return { status: "rejected", reason };
    };
    const { rows } = await c.query("SELECT customer_id, total_cents, status FROM orders WHERE id = $1 FOR UPDATE", [req.orderId]);
    const order = rows[0];
    if (!order || order.customer_id !== req.customerId) return reject("not_found");
    const dup = await c.query("SELECT 1 FROM refunds WHERE tool_use_id = $1", [req.toolUseId]);
    if (dup.rows.length) {
      await c.query("ROLLBACK");
      return { status: "duplicate" };
    }
    if (order.status !== "paid" && order.status !== "shipped") return reject("bad_status");
    if (req.amountCents > req.maxCents) return reject("over_limit");
    const sum = await c.query("SELECT COALESCE(sum(amount_cents), 0)::int AS done FROM refunds WHERE order_id = $1", [req.orderId]);
    const done = sum.rows[0].done;
    if (done + req.amountCents > order.total_cents) return reject("over_remaining");
    await c.query("INSERT INTO refunds (order_id, amount_cents, tool_use_id) VALUES ($1, $2, $3)", [req.orderId, req.amountCents, req.toolUseId]);
    await c.query("COMMIT");
    return { status: "refunded", remainingCents: order.total_cents - done - req.amountCents };
  } catch (err) {
    await c.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    c.release();
  }
}
