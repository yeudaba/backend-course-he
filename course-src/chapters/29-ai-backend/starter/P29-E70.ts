// P29-E70: הצעת החזר, ואישור בכפתור
// כתוב וייצא:
//   type Order = { id: number; userId: number; totalIls: number };
//   type Orders = { get(id: number): Promise<Order | null>; refund(orderId: number, amountIls: number): Promise<void> };
//   export function createRefundActions(opts: { orders: Orders; ttlMs?: number; now?: () => number }): {
//     propose(userId: number, input: { order_id: number; amount_ils: number }): Promise<{ actionId: string; summary: string }>;
//     confirm(userId: number, actionId: string): Promise<{ status: "done" | "already_done" }>;
//   }
//
// בדיקה:  npm run check P29-E70
