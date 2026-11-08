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

export function applyEvent(state: Map<number, OrderView>, e: OrderEvent): boolean {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function project(events: OrderEvent[]): { state: Map<number, OrderView>; applied: number; ignored: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
