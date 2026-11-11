// P17-E45: מ־JSON מקונן לטבלאות
export type FlatOrder = { orderId: number; email: string; fullName: string; items: { product: string; price: number; qty: number }[] };
export type Tables = {
  customers: { id: number; email: string; full_name: string }[];
  products: { id: number; name: string }[];
  orders: { id: number; customer_id: number }[];
  order_items: { order_id: number; product_id: number; quantity: number; unit_price: number }[];
};

export function normalize(input: FlatOrder[]): Tables {
  const t: Tables = { customers: [], products: [], orders: [], order_items: [] };
  const customerIds = new Map<string, number>();
  const productIds = new Map<string, number>();

  for (const o of input) {
    const email = o.email.toLowerCase();
    let customerId = customerIds.get(email);
    if (customerId === undefined) {
      customerId = customerIds.size + 1;
      customerIds.set(email, customerId);
      t.customers.push({ id: customerId, email, full_name: o.fullName });
    }
    t.orders.push({ id: o.orderId, customer_id: customerId });

    const lines = new Map<number, Tables["order_items"][number]>();
    for (const item of o.items) {
      let productId = productIds.get(item.product);
      if (productId === undefined) {
        productId = productIds.size + 1;
        productIds.set(item.product, productId);
        t.products.push({ id: productId, name: item.product });
      }
      const line = lines.get(productId);
      if (line) line.quantity += item.qty;
      else {
        const row = { order_id: o.orderId, product_id: productId, quantity: item.qty, unit_price: item.price };
        lines.set(productId, row);
        t.order_items.push(row);
      }
    }
  }
  return t;
}
