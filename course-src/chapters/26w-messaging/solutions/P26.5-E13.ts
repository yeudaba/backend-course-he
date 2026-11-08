// P26.5-E13: projection — מצב ההזמנות מתוך זרם אירועים (עם כפילויות ואי־סדר)
export interface OrderEvent {
  orderId: number;
  seq: number; // מספר רץ לכל הזמנה: 1, 2, 3…
  type: "order.placed" | "order.paid" | "order.shipped" | "order.cancelled";
}

export interface OrderView {
  status: "placed" | "paid" | "shipped" | "cancelled";
  seq: number;
}

const STATUS = { "order.placed": "placed", "order.paid": "paid", "order.shipped": "shipped", "order.cancelled": "cancelled" } as const;

export function applyEvent(state: Map<number, OrderView>, e: OrderEvent): boolean {
  const cur = state.get(e.orderId);
  if (cur && e.seq <= cur.seq) return false; // כפילות, או אירוע ישן שהגיע מאוחר
  if (cur?.status === "cancelled") return false; // סופי
  state.set(e.orderId, { status: STATUS[e.type], seq: e.seq });
  return true;
}

export function project(events: OrderEvent[]) {
  const state = new Map<number, OrderView>();
  let applied = 0;
  for (const e of events) if (applyEvent(state, e)) applied++;
  return { state, applied, ignored: events.length - applied };
}
