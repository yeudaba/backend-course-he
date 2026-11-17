// P17-E55: משורות שטוחות לאובייקטים
export type FlatRow = { order_id: number; full_name: string; status: string; product: string | null; quantity: number | null; unit_price: number | null };
export type Item = { product: string; quantity: number; unitPrice: number; lineTotal: number };
export type OrderView = { id: number; customer: string; status: string; items: Item[]; total: number };

export function nestOrders(rows: FlatRow[]): OrderView[] {
  const byId = new Map<number, OrderView>();
  const cents = new Map<number, number>();
  for (const r of rows) {
    let order = byId.get(r.order_id);
    if (!order) {
      order = { id: r.order_id, customer: r.full_name, status: r.status, items: [], total: 0 };
      byId.set(r.order_id, order);
      cents.set(r.order_id, 0);
    }
    if (r.product === null || r.quantity === null || r.unit_price === null) continue;
    const line = Math.round(r.unit_price * 100) * r.quantity;
    order.items.push({ product: r.product, quantity: r.quantity, unitPrice: r.unit_price, lineTotal: line / 100 });
    cents.set(r.order_id, cents.get(r.order_id)! + line);
  }
  for (const order of byId.values()) order.total = cents.get(order.id)! / 100;
  return [...byId.values()];
}
