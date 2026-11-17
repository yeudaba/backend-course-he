// P17-E43: בודק FK בזיכרון
export type Data = {
  customers: { id: number }[];
  products: { id: number }[];
  orders: { id: number; customer_id: number }[];
  order_items: { order_id: number; product_id: number }[];
};

const missing = (col: string, value: number, table: string) => `Key (${col})=(${value}) is not present in table "${table}".`;

export function checkForeignKeys(data: Data): string[] {
  const customerIds = new Set(data.customers.map((c) => c.id));
  const productIds = new Set(data.products.map((p) => p.id));
  const orderIds = new Set(data.orders.map((o) => o.id));
  const problems: string[] = [];
  for (const o of data.orders) {
    if (!customerIds.has(o.customer_id)) problems.push(missing("customer_id", o.customer_id, "customers"));
  }
  for (const i of data.order_items) {
    if (!orderIds.has(i.order_id)) problems.push(missing("order_id", i.order_id, "orders"));
    if (!productIds.has(i.product_id)) problems.push(missing("product_id", i.product_id, "products"));
  }
  return problems;
}
