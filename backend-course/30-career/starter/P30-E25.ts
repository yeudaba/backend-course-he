// P30-E25: event sourcing — שחזור מצב הזמנה מאירועים
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

export function replay(events: readonly OrderEvent[]): OrderState {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function replayAll(events: readonly OrderEvent[]): { orders: OrderState[]; errors: { orderId: number; message: string }[] } {
  throw new Error("עוד לא כתבת את הפתרון");
}
