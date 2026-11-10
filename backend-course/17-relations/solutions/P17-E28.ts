// P17-E28: JOIN ו־GROUP BY בקוד
export type Customer = { id: number; full_name: string; city: string | null };
export type Order = { id: number; customer_id: number; status: string };
export type OrderItem = { order_id: number; quantity: number; unit_price: number };
export type CityRevenue = { city: string; revenue: number };

export function revenueByCity(customers: Customer[], orders: Order[], items: OrderItem[]): CityRevenue[] {
  // "אינדקס" לפי id — כמו JOIN ... ON c.id = o.customer_id, בלי לחפש במערך כל פעם
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const orderById = new Map(orders.map((o) => [o.id, o]));

  const agorotByCity = new Map<string, number>();
  for (const item of items) {
    const order = orderById.get(item.order_id);
    if (!order || order.status === "cancelled") continue;
    const city = customerById.get(order.customer_id)?.city ?? "unknown";
    const agorot = Math.round(item.quantity * item.unit_price * 100);
    agorotByCity.set(city, (agorotByCity.get(city) ?? 0) + agorot);
  }

  return [...agorotByCity]
    .map(([city, agorot]) => ({ city, revenue: agorot / 100 }))
    .sort((a, b) => b.revenue - a.revenue || a.city.localeCompare(b.city));
}

const customers = [
  { id: 1, full_name: "Dana", city: "Haifa" },
  { id: 2, full_name: "Avi", city: null },
];
const orders = [
  { id: 10, customer_id: 1, status: "paid" },
  { id: 11, customer_id: 2, status: "pending" },
  { id: 12, customer_id: 1, status: "cancelled" },
];
const items = [
  { order_id: 10, quantity: 3, unit_price: 19.9 },
  { order_id: 11, quantity: 1, unit_price: 89.9 },
  { order_id: 12, quantity: 5, unit_price: 100 },
];
console.log(revenueByCity(customers, orders, items));
