// P30-E25
// שאלת "בית" מתקדמת: event sourcing בקטן. במקום לשמור רק את המצב הנוכחי של הזמנה, שומרים את כל האירועים,
// ומשחזרים את המצב מהם — עם אותה מכונת מצבים מפרויקט 3. אירוע לא חוקי ← שגיאה שאומרת איפה
export type OrderEvent =
  | { orderId: number; type: "created"; at: string; totalCents: number }
  | { orderId: number; type: "paid"; at: string; amountCents: number }
  | { orderId: number; type: "shipped"; at: string }
  | { orderId: number; type: "cancelled"; at: string }
  | { orderId: number; type: "refunded"; at: string; amountCents: number };

export type Status = "pending_payment" | "paid" | "shipped" | "cancelled";

export interface OrderState {
  orderId: number;
  status: Status;
  totalCents: number;
  paidCents: number;
  refundedCents: number;
  history: { status: Status; at: string }[];
}

export class InvalidEvent extends Error {
  index: number;
  constructor(index: number, message: string) {
    super(`אירוע ${index}: ${message}`);
    this.index = index;
  }
}

const NEXT: Record<Status, Partial<Record<OrderEvent["type"], Status>>> = {
  pending_payment: { paid: "paid", cancelled: "cancelled" },
  paid: { shipped: "shipped", cancelled: "cancelled" },
  shipped: {},
  cancelled: {},
};

export function replay(events: readonly OrderEvent[]): OrderState {
  if (events.length === 0 || events[0].type !== "created") throw new InvalidEvent(0, "הזמנה חייבת להתחיל ב־created");
  const first = events[0];
  const s: OrderState = { orderId: first.orderId, status: "pending_payment", totalCents: first.totalCents, paidCents: 0, refundedCents: 0, history: [{ status: "pending_payment", at: first.at }] };
  for (let i = 1; i < events.length; i++) {
    const e = events[i];
    if (e.orderId !== s.orderId) throw new InvalidEvent(i, `שייך להזמנה ${e.orderId}`);
    if (Date.parse(e.at) < Date.parse(events[i - 1].at)) throw new InvalidEvent(i, "לפני האירוע הקודם");
    if (e.type === "refunded") {
      if (s.status !== "cancelled") throw new InvalidEvent(i, "החזר רק להזמנה מבוטלת");
      if (s.refundedCents + e.amountCents > s.paidCents) throw new InvalidEvent(i, "החזר גדול ממה ששולם");
      s.refundedCents += e.amountCents;
      continue;
    }
    if (e.type === "created") throw new InvalidEvent(i, "created כפול");
    const to = NEXT[s.status][e.type];
    if (!to) throw new InvalidEvent(i, `${e.type} לא אפשרי במצב ${s.status}`);
    if (e.type === "paid") {
      if (e.amountCents !== s.totalCents) throw new InvalidEvent(i, `שולם ${e.amountCents}, הסכום ${s.totalCents}`);
      s.paidCents = e.amountCents;
    }
    s.status = to;
    s.history.push({ status: to, at: e.at });
  }
  return s;
}

// כל ההזמנות מזרם אחד; הזמנה עם אירוע לא חוקי — נכנסת לרשימת השגיאות ולא מפילה את השאר
export function replayAll(events: readonly OrderEvent[]) {
  const byOrder = new Map<number, OrderEvent[]>();
  for (const e of events) (byOrder.get(e.orderId) ?? byOrder.set(e.orderId, []).get(e.orderId)!).push(e);
  const orders: OrderState[] = [];
  const errors: { orderId: number; message: string }[] = [];
  for (const [orderId, list] of [...byOrder].sort((a, b) => a[0] - b[0])) {
    try {
      orders.push(replay(list));
    } catch (err) {
      errors.push({ orderId, message: (err as Error).message });
    }
  }
  return { orders, errors };
}
