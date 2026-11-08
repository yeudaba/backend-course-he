export type OrderStatus = "pending_payment" | "paid" | "shipped" | "cancelled";
export type OrderAction = "pay" | "ship" | "cancel";

// מכונת המצבים של הזמנה — במקום אחד, בלי מסד, ונבדקת ב־unit tests
const TRANSITIONS: Record<OrderAction, Partial<Record<OrderStatus, OrderStatus>>> = {
  pay: { pending_payment: "paid" },
  ship: { paid: "shipped" },
  cancel: { pending_payment: "cancelled", paid: "cancelled" }, // נשלחה — כבר אי אפשר לבטל
};

export function nextStatus(current: OrderStatus, action: OrderAction): OrderStatus | null {
  return TRANSITIONS[action][current] ?? null;
}

export function fromStatuses(action: OrderAction): OrderStatus[] {
  return Object.keys(TRANSITIONS[action]) as OrderStatus[];
}
