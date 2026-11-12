// P25.7-E69: ממסמך לשורות — order ו־order_items
type OrderDoc = { _id: string; customerId: string; status: string; createdAt: Date; items: { productId: string; name: string; price: number; qty: number }[] };

export function toRows(order: OrderDoc) {
  const items = order.items.map((it, i) => ({ order_id: order._id, line: i + 1, product_id: it.productId, quantity: it.qty, unit_price: it.price }));
  return {
    order: {
      id: order._id,
      customer_id: order.customerId,
      status: order.status,
      created_at: order.createdAt.toISOString(),
      total: items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
    },
    items,
  };
}
