// נתוני היחידה: "חנות קפה" קטנה בזיכרון — לקוחות, מוצרים והזמנות
export interface Order {
  id: number;
  customerId: number;
  status: "placed" | "paid" | "shipped" | "cancelled" | "refunded";
  totalCents: number;
  items: { product: string; quantity: number }[];
}

export function createStore() {
  return {
    customers: new Map([
      [1, { id: 1, name: "Dana Levi", email: "dana@example.com" }],
      [2, { id: 2, name: "Yossi Cohen", email: "yossi@example.com" }],
    ]),
    products: [
      { id: 1, name: "Colombia Supremo 1kg", priceCents: 8990, stock: 12 },
      { id: 2, name: "Ethiopia Yirgacheffe 250g", priceCents: 5490, stock: 0 },
      { id: 3, name: "Hand Grinder", priceCents: 18900, stock: 4 },
      { id: 4, name: "V60 Dripper", priceCents: 6900, stock: 9 },
    ],
    orders: new Map<number, Order>([
      [101, { id: 101, customerId: 1, status: "paid", totalCents: 8990, items: [{ product: "Colombia Supremo 1kg", quantity: 1 }] }],
      [102, { id: 102, customerId: 1, status: "shipped", totalCents: 18900, items: [{ product: "Hand Grinder", quantity: 1 }] }],
      [201, { id: 201, customerId: 2, status: "paid", totalCents: 6900, items: [{ product: "V60 Dripper", quantity: 1 }] }],
    ]),
    refunds: [] as { orderId: number; amountCents: number }[],
  };
}
export type Store = ReturnType<typeof createStore>;
