// P11-E15: מכונת מצבים של הזמנה
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type Order = { id: number; status: OrderStatus };

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function allowedNext(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(order: Order, to: OrderStatus): Order {
  if (!canTransition(order.status, to)) {
    throw new Error(`לא ניתן לעבור מ־${order.status} ל־${to}`);
  }
  return { ...order, status: to };
}

console.log(transition({ id: 1, status: "pending" }, "paid"), allowedNext("shipped"));
