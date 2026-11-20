// P29-E70: הצעת החזר, ואישור בכפתור
import { randomUUID } from "node:crypto";

type Order = { id: number; userId: number; totalIls: number };
type Orders = { get(id: number): Promise<Order | null>; refund(orderId: number, amountIls: number): Promise<void> };
type Pending = { userId: number; orderId: number; amount: number; expiresAt: number; status: "pending" | "done" };

export function createRefundActions(opts: { orders: Orders; ttlMs?: number; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const ttlMs = opts.ttlMs ?? 10 * 60_000;
  const actions = new Map<string, Pending>();

  return {
    async propose(userId: number, input: { order_id: number; amount_ils: number }) {
      const order = await opts.orders.get(input.order_id);
      if (!order || order.userId !== userId) throw new Error("ההזמנה לא נמצאה");
      if (!(input.amount_ils > 0 && input.amount_ils < order.totalIls)) throw new Error(`סכום לא תקין (עד ${order.totalIls})`);
      const actionId = randomUUID();
      actions.set(actionId, { userId, orderId: order.id, amount: input.amount_ils, expiresAt: now() + ttlMs, status: "pending" });
      return { actionId, summary: `החזר של ${input.amount_ils} ש״ח על הזמנה ${order.id}` };
    },

    async confirm(userId: number, actionId: string): Promise<{ status: "done" | "already_done" }> {
      const a = actions.get(actionId);
      if (!a || a.userId !== userId) throw new Error("הפעולה לא נמצאה");
      if (a.status === "done") return { status: "already_done" };
      if (now() >= a.expiresAt) throw new Error("פג תוקף — בקש מהעוזר הצעה חדשה");
      a.status = "done"; // לפני ה־await: לחיצה שנייה במקביל רואה done
      try {
        await opts.orders.refund(a.orderId, a.amount);
      } catch (err) {
        a.status = "pending";
        throw err;
      }
      return { status: "done" };
    },
  };
}
